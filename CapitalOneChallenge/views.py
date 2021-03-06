import sys

from django.core.exceptions import PermissionDenied
from django.http import (HttpResponse, HttpResponseNotFound,
    HttpResponseBadRequest, HttpResponseServerError)
from django.views.generic.base import View
from django.views.generic import TemplateView

from django.shortcuts import render

from django.contrib.auth.views import redirect_to_login

from instagram.client import InstagramAPI
import urllib2, urllib, json

class ErrorView(View):
    """ HTTP 500: Internal Server Error """
    template_name = '500.html'
    status = 500
    
    def get(self, request):
        return render(request, self.template_name, status=self.status)
    
    
class PermissionDeniedView(ErrorView):
    """ HTTP 403: Forbidden """
    template_name = '403.html'
    status = 403
    
    
class NotFoundView(ErrorView):
    """ HTTP 404: Not Found """
    template_name = '404.html'
    status = 404
    
    
class IndexPage(TemplateView):
    """ The Index Page. """

    def get(self, request):
        api = generateInstragramAPI()

        posts = []
        recent_tags = api.tag_recent_media(count=20, tag_name="CapitalOne")
        top = []
        for tag in recent_tags[0]:
            user = api.user(tag.user.id)

            # Parse comment and get sentiment analysis of the comment
            comment = tag.caption.text.replace("#", "")
            sentiment_analysis = getSentimentAnalysis(comment)

            # Pushes data to posts and top posts
            posts.append((tag, user, sentiment_analysis)) 
            if(sentiment_analysis["label"] == "pos"):
                top.append((tag.user.username, tag.caption.text))
            
        if(len(top) > 3):
            top = top[0:3]

        return render(request, "index.html", {"posts": posts, "top": top})

class TrendingDataPage(TemplateView):
    def get(self, request):
        # API endpoint to get data for charts
        params = request.GET
        api = generateInstragramAPI()

        data = dict()
        # Generate data from most recent media or continue from another post
        if "next" in params:
            url = params["next"] + "&count=" + params["count"] + "&sig=" + params["sig"] + "&max_tag_id=" + params["max_tag_id"]
            recent_tags, next_ = api.tag_recent_media(with_next_url=url, count=33, tag_name="CapitalOne")
        else:
            recent_tags, next_ = api.tag_recent_media(count=33, tag_name="CapitalOne")

        more_tags, next_ = api.tag_recent_media(with_next_url=next_, count=33, tag_name="CapitalOne")
        recent_tags.extend(more_tags)

        # Parse values into dictionary
        for tag in recent_tags:
            time = tag.created_time.strftime("%Y-%m-%d")
            comment = tag.caption.text.replace("#", "")
            sentiment_analysis = getSentimentAnalysis(comment)

            if time not in data:
                data[time] = dict()
                data[time]["neutral"] = 0
                data[time]["pos"] = 0
                data[time]["neg"] = 0
            data[time][sentiment_analysis["label"]] += 1
        data = [next_, data]

        return HttpResponse(json.dumps(data), content_type='application/json')
    
def staff_only(view):
    """ Staff-only View decorator. """
    
    def decorated_view(request, *args, **kwargs):
        if not request.user.is_authenticated():
            return redirect_to_login(request.get_full_path())
            
        if not request.user.is_staff:
            raise PermissionDenied
            
        return view(request, *args, **kwargs)
        
    return decorated_view
    
def generateInstragramAPI():
    # Setup for using Instagram API and the api keys
    access_token = "471186409.290c177.f0ec9eed516a4b5f976321e0aa54e5a0"
    client_secret = "30868d2793a14376b27702a4cef10f17"
    return InstagramAPI(access_token=access_token, client_secret=client_secret)

def getSentimentAnalysis(comment):
    # Setup for using Text-Processing Sentiment Analysis
    post_data = [('text', comment.encode('utf-8'))]
    sentiment_analysis = urllib2.urlopen('http://text-processing.com/api/sentiment/', urllib.urlencode(post_data))
    return json.load(sentiment_analysis)