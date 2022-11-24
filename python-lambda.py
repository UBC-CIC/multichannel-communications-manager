         from __future__ import print_function
          import os
          import json
          import base64
          import boto3
          from datetime import date

          pinpoint_app_id = os.environ['PINPOINT_APPID']

          # Lambda handler
        def lambda_handler(event, context):
            # Loop over all records and print out
            for record in event['Records']:
              # Decode data
              payload = json.loads(base64.b64decode(record["kinesis"]["data"]))
              optOut = 'ALL' if payload['data']['optin'] == 0 else 'NONE'
              # Validate phone nunber
              phone_valid = validate_phone(payload['data']['phone'])
              if phone_valid != False:
                print('# Phone=VALID OptOut=' + optOut + ' ' + str(payload['data']['optin']))
                # Update Pinpoint endpoint
                update_endpoint(payload['metadata']['operation'], payload['data'], phone_valid)
              else:
                print('# Phone=ERROR OptOut=' + optOut + ' ' + str(payload['data']['optin']))

          # Validate phone number
          def validate_phone(phone):
            client = boto3.client('pinpoint')
            response = client.phone_number_validate(
              NumberValidateRequest={
                'PhoneNumber': phone
              }
            )
            return response

          # Pinpoint update endpoint
          def update_endpoint(operation, data, phone):
            client = boto3.client('pinpoint')
            endpoint_id = data['userid'] + '_' + data['phone']
            if operation == 'insert' or operation == 'update':
              print('# Operation=' + operation + ' ' + endpoint_id)
              optout = 'ALL' if data['optin'] == 0 else 'NONE'
              response = client.update_endpoint(
                ApplicationId=pinpoint_app_id,
                EndpointId=endpoint_id,
                EndpointRequest={
                  'Address': phone['NumberValidateResponse']['CleansedPhoneNumberE164'],
                  'ChannelType': 'SMS',
                  'EffectiveDate': data['lastupdate'],
                  'EndpointStatus': 'ACTIVE',
                  'Demographic': {
                    'Make': 'apple',
                    'Model': 'iPhone',
                    'ModelVersion': '13.5',
                    'Platform': 'ios'
                  },
                  'Location': {
                    'City': 'Boston',
                    'Country': 'US'
                  },
                  'OptOut': optout,
                  'User': {
                    'UserId': data['userid']
                  }
                }
              )
            elif operation == 'delete':
              print('# Operation=' + operation + ' ' + endpoint_id)
              response = client.delete_endpoint(
                ApplicationId=pinpoint_app_id,
                EndpointId=endpoint_id
              )
      