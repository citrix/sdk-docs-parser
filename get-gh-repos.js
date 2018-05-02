const packagejson = require('./package.json');
const request = require('request');
const rp = require('request-promise-native');
const fs = require('fs');
//url
//description
(
    async() => {
        var reposBody = await rp(
            {
                url:'https://api.github.com/orgs/citrix/repos?per_page=150',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Test Node app'
                }
            });

        var repoList = { repo: []};

        var repos = JSON.parse(reposBody);
        console.log(repos.length);
        
        for (const repo of repos) {
            //console.log(repo.url, repo.name);
            repoList.repo.push({name:repo.name,url:repo.url});
        }

        fs.writeFile("./repolist.json", JSON.stringify(repoList));

    }
)()