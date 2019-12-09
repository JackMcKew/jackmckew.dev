"""A simple example of how to access the Google Analytics API."""

from apiclient.discovery import build
from oauth2client.service_account import ServiceAccountCredentials
import parsedatetime as pdt
import datetime
import sys,codecs


from pelican import signals
from pelican.generators import ArticlesGenerator, PagesGenerator

oFile= codecs.open("result.txt","w","utf-8")

import httplib2

#GA Page VIEWS
GOOGLE_SERVICE_ACCOUNT = 'banaieir@banaieir.iam.gserviceaccount.com '
GOOGLE_KEY_FILE = 'banaieir-2c57b32337ee.json'
GA_START_DATE = '2018-07-20'
GA_END_DATE = 'today'
GA_METRIC = 'ga:pageviews'
POPULAR_POST_START = '1monthAgo'


import linecache
import sys

def ExceptionDetails():
    exc_type, exc_obj, tb = sys.exc_info()
    f = tb.tb_frame
    lineno = tb.tb_lineno
    filename = f.f_code.co_filename
    linecache.checkcache(filename)
    line = linecache.getline(filename, lineno, f.f_globals)
    return ('EXCEPTION IN ({}, LINE {} "{}"): {}'.format(filename, lineno, line.strip(), exc_obj))


def get_service(api_name, api_version, scopes, key_file_location):
    try :
        """Get a service that communicates to a Google API.
    
        Args:
            api_name: The name of the api to connect to.
            api_version: The api version to connect to.
            scopes: A list auth scopes to authorize for the application.
            key_file_location: The path to a valid service account JSON key file.
    
        Returns:
            A service that is connected to the specified API.
        """

        credentials = ServiceAccountCredentials.from_json_keyfile_name(
                key_file_location, scopes=scopes)

        # Build the service object.
        service = build(api_name, api_version, credentials=credentials,cache_discovery=False)

        return service
    except :
        sys.stderr.write("[ga_page_view] Failed to fetch page view information. "+ExceptionDetails())
        return None


def get_first_profile_id(service):
    try :
        # Use the Analytics service object to get the first profile id.

        # Get a list of all Google Analytics accounts for this user
        accounts = service.management().accounts().list().execute()

        if accounts.get('items'):
            # Get the first Google Analytics account.
            account = accounts.get('items')[0].get('id')

            # Get a list of all the properties for the first account.
            properties = service.management().webproperties().list(
                    accountId=account).execute()

            if properties.get('items'):
                # Get the first property id.
                property = properties.get('items')[0].get('id')

                # Get a list of all views (profiles) for the first property.
                profiles = service.management().profiles().list(
                        accountId=account,
                        webPropertyId=property).execute()

                if profiles.get('items'):
                    # return the first view (profile) id.
                    return profiles.get('items')[0].get('id')
    except :
        sys.stderr.write("[ga_page_view] Failed to fetch page view information. "+ ExceptionDetails())

    return None





def get_results(service, profile_id):
    # Use the Analytics Service Object to query the Core Reporting API
    # for the number of sessions within the past seven days.
    return service.data().ga().get(
            ids='ga:' + profile_id,
            start_date='7daysAgo',
            end_date='today',
            metrics='ga:sessions').execute()


def print_results(results):
    # Print data nicely for the user.
    if results:
        print ('View (Profile):', results.get('profileInfo').get('profileName'))
        print ('Total Sessions:', results.get('rows')[0][0])

    else:
        print ('No results found')

def print_pageviews (service, profile_id) :
    service_account_email = GOOGLE_SERVICE_ACCOUNT
    key_file_path =GOOGLE_KEY_FILE

    page_view = dict()
    popular_page_view = dict()

    try:
        # scope = ['https://www.googleapis.com/auth/analytics.readonly']
        # service = get_service(
        #     api_name='analytics',
        #     api_version='v3',
        #     scopes=[scope],
        #     key_file_location=GOOGLE_KEY_FILE)
        # profile_id = get_first_profile_id(service)

        start_date = GA_START_DATE
        end_date = GA_END_DATE
        metric = GA_METRIC

        result = service.data().ga().get(ids='ga:' + profile_id, start_date=start_date,
                                        end_date=end_date, max_results=999999, metrics=metric,
                                        dimensions='ga:pagePath').execute()



        for slug, pv in result['rows']:
            page_view[slug] = int(pv)
            oFile.write( slug + " : " + pv+"\r\n")

        
        popular_start_str = POPULAR_POST_START
        popular_start_date = str(pdt.Calendar().parseDT(
            popular_start_str, datetime.datetime.now())[0].date())
        popular_result = service.data().ga().get(
            ids='ga:' + profile_id, start_date=popular_start_date,
            end_date=end_date, max_results=999999, metrics=metric,
            dimensions='ga:pagePath').execute()

        for slug, pv in popular_result['rows']:
            popular_page_view[slug] = int(pv)
    except :
        sys.stderr.write("[ga_page_view] Failed to fetch page view information. \n" + ExceptionDetails())
        # ExceptionDetails()




def main():
     # Define the auth scopes to request.
     scope = 'https://www.googleapis.com/auth/analytics.readonly'
     key_file_location = 'banaieir-2c57b32337ee.json'

     # Authenticate and construct service.
     service = get_service(
             api_name='analytics',
             api_version='v3',
             scopes=[scope],
             key_file_location=key_file_location)

     profile_id = get_first_profile_id(service)
     print_results(get_results(service, profile_id))
     print_pageviews(service, profile_id)


if __name__ == '__main__':
     main()

oFile.close()