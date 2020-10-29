# H5P LTI Provider

> An application for building H5P interactions and serving them over LTI v1.0 / v1.1

## About LTI

LTI (Learning Tools Interoperability®) provides a standard mechanism for authorizing users accessing a web-based application (Tool Provider) from another web-based application (Tool Consumer, typically an LMS). It can be seen as replacing a login page which a Tool Provider may otherwise have provided and avoids the need to distribute a username and password to each user. Instead a signed launch message is received from the Tool Consumer which can be verified and then trusted. This message should contain sufficient data from which to create user accounts and relevant resources (or resource mappings) "on-the-fly". Users gain a seamless experience without the need for any pre-provisioning, involvement of any other servers (for example, identity providers), or changing of any firewalls (message is sent through the user's browser). LTI works best when the Tool Provider delegates full responsibility for authorizing users to the Tool Consumer and does not allow users to directly access their system, thereby bypassing this authorization. This means that there is no need for the two systems to be synchronized with any changes to user privileges, so there is no risk of a user being given access to resources to which they are no longer entitled.

## About H5P

## Author

> Dom Starkey - [Github](https://github.com/domstarkey) - [LinkedIn](https://www.linkedin.com/in/dom-starkey/)

> Kiron - https://kiron.ngo

## Installing / Getting started

Create a .env file with the following:

```
SESSION_SECRET={{Some secret}}
PORT={{A local port, for development}}
OAUTH_CONSUMER_KEY={{A consumer key, e.g. kiron-lti-h5p}}
OAUTH_SECRET={{A longish secret}}
REDIS_URL={{A redis url}}
DOMAIN={{A hostname}}
NODE_ENV={{ e.g. development}}
```

`docker build` and `docker push` will then help create your docker image.
Make sure you update `docker-compose` to better suit your situation. (e.g. Replace the image!)

You might want to set up a cron job to restart the service each day - It will download the latest H5P Libraries.


### Initial Configuration

Inside your learning tool, you will want to specify the following:

&exercise=
&language=
&cssconfig=

## Features

This application performs a number of functions:

- [x] Create, upload or edit H5P activities
- [x] Preview H5P activities
- [x] Specify custom H5P CSS file
- [x] Serve H5P activities as an LTI Provider
- [x] Send grades back to LTI Consumer

The scores in HPI do not go down

## Architecture

- [x] Node application for LTI provider of H5P player
- [x] Node application for H5P Editor
- [x] Redis node for LTI memory storage

-  **Optional:**
    - [x] External MongoDB for DB storage 

## Remote DB + S3 file storage

To make use of S3 storage and a mongo database to make the application horizontally 
scalable and remove all state from a single instance, we can enable saving data in mongoDB and files on AWS S3.

For the mongo DB host, make sure that:

* You specify the host like this: "mongodb://{{host}}:{{port}}"
* If you are connecting to a localhost mongo db instance, make sure that service is exposed to docker - it is not sufficient to have localhost as the port. See more [here](https://docs.docker.com/docker-for-mac/networking/#use-cases-and-workarounds) 

You can get access to a free test MongoDB cluster [here](https://mongodb.com) to test.

Add the following to your env file and the application will do the rest:

```
TEMPORARYSTORAGE=s3
AWS_ACCESS_KEY_ID={{S3 access key}}
AWS_SECRET_ACCESS_KEY={{S3 access key}}
AWS_S3_ENDPOINT="https://s3.amazonaws.com"
AWS_REGION={{ e.g. eu-central-1 }}
CONTENT_AWS_S3_BUCKET={{your-content-bucket-name}
CONTENT_MONGO_COLLECTION=h5p
TEMPORARY_AWS_S3_BUCKET={{your-temporary-file-bucket-name}}
CONTENTSTORAGE=mongos3
MONGODB_URL="mongodb://{{host}}:{{port}}"
MONGODB_DB={{mongodbname}}
MONGODB_USER={{mongodbuser}}
MONGODB_PASSWORD={{mongodbpass}}
```

## Testing

 - Some tests under /tests
 - Run `yarn test`

## LTI Consumer Versions

This application has been developed and tested for use with OpenHPI. It's standards compliant with LTI v1p0 with the extensions for outcome_service and ext_content from LTI v1p1 included, in order to match what is required by Open HPI.

It should work with all LTI v1 and 1.1 and 1.1.1 Consumers.

If you're looking for a tool for LTI v1.2 or 1.3 consumers, you might have some luck in adapting this codebase and replacing lms-lti with [ltijs](https://www.npmjs.com/package/ltijs)

## Contributing

If you'd like to contribute, please fork the repository and use a feature
branch. Pull requests are warmly welcome.

## Links

- Related projects:
  - H5P: https://h5p.org/
  - IMS LTI: http://www.imsglobal.org/activity/learning-tools-interoperability
  - IMS LTI NPM Package: https://www.npmjs.com/package/ims-lti
  - nodejs-lti-provider: https://github.com/js-kyle/nodejs-lti-provider
  - LTIjs: https://github.com/Cvmcosta/ltijs
  - H5P-Nodejs-library: https://github.com/Lumieducation/H5P-Nodejs-library

## Licensing

The code in this project is licensed under MIT license.

Copyright (c) 2020 Kiron gGmbH

Full details in the [LICENCE](./LICENCE) file
