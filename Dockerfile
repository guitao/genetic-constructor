# Inherit from ubuntu docker image
FROM ubuntu:14.04

MAINTAINER bionanodevops@autodesk.com # 2016-08-15
ENV CXX g++-4.9
RUN apt-get dist-upgrade -y
RUN apt-get update -y
RUN apt-get upgrade -y

RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:ubuntu-toolchain-r/test
RUN apt-get update -y

# Explicit set of apt-get commands to workaround issue https://github.com/nodegit/nodegit/issues/886 . Workaround instructions here: http://stackoverflow.com/questions/16605623/where-can-i-get-a-copy-of-the-file-libstdc-so-6-0-15
RUN apt-get install -y curl gcc-4.9 g++-4.9 libstdc++-4.9-dev

RUN apt-get install -y python python-dev python-pip git build-essential wget && \
	curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash - && \
	sudo apt-get -y install nodejs && \
	apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#everything needed by extensions
RUN yes | pip install biopython

RUN pip install awscli

#temp - instal fsharp
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN echo "deb http://download.mono-project.com/repo/debian wheezy main" | tee /etc/apt/sources.list.d/mono-xamarin.list
RUN apt-get update -y
RUN apt-get install -y mono-complete fsharp

EXPOSE 3000
ENV PORT=3000

RUN mkdir /app
WORKDIR /app

#setup node
ADD package.json /app/package.json
RUN npm update -g npm && npm install

ADD . /app
#install extensions, continue even if errors
RUN npm run install-extensions || true

# add docs, even if package.json hasnt changed
RUN npm run jsdoc

RUN cd /app

# Redis now launch via docker-compose and is referenced via link
CMD  ["npm" , "run", "start-instance"]
