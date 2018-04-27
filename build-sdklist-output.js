const packagejson = require('./package.json');
const doclist = require('./documentationlist.json');
const yaml = require('js-yaml');
const request = require('request');
const rp = require('request-promise-native');
const fs = require('fs');

(async () => {
    var mainSDKUrl;
    var outJSON = [];
    //outJSON.documentation = [];

    for (const project of doclist) {
        var yamlurl = `https://raw.githubusercontent.com/citrix/${project.githubrepo}/master/mkdocs.yml`
        
        var body = await rp(yamlurl)
        
        var markdownBody = body;
        var tocObject = yaml.safeLoad(markdownBody);

        console.log(`trying: ${packagejson.basedocsurl}${project.rtd}/`);
        
       
        var redirectResp = await rp({
            url:`${packagejson.basedocsurl}${project.rtd}/`,
            followRedirect:false,
            simple: false, 
            resolveWithFullResponse: true
        });
       
        if ( redirectResp.statusCode == 302 )
        {
            mainSDKUrl = redirectResp.headers.location;
        }
        else
        {
            mainSDKUrl = `${packagejson.basedocsurl}${project}`;
        }

        
        var sdkItem = {};
        sdkItem.pages = [];
        sdkItem.sdktitle = tocObject.site_name;

        for (var page of tocObject.pages) {
   
            var pageKey = Object.keys(page)[0];
            var pageValue = page[pageKey];

            if ( 
                pageKey.toLowerCase().indexOf('class') == -1 && 
                pageKey.toLowerCase().indexOf('delegate') == -1 &&
                !Array.isArray(pageValue) &&
                pageKey.toLowerCase().indexOf('enumeration') == -1 &&
                pageKey.toLowerCase().indexOf('namespace') == -1 &&
                pageKey.toLowerCase().indexOf('_') == -1
            )
            {
                pageValue = pageValue.toString().replace('.md','');

                if ( pageValue == "index")
                {   
                    pageValue = pageValue.replace('.md','');
                    sdkItem.sdkmainurl = mainSDKUrl;
                }
                else
                {
                    var sdkSubItem = {};
                    sdkSubItem.pagetitle = pageKey;
                    sdkSubItem.pagelink = `${mainSDKUrl}/${pageValue}`;
                    sdkItem.pages.push(sdkSubItem);
                }   
            }
        }
        
        outJSON.push(sdkItem);
    }
    fs.writeFile("./sdkdoclist.json", JSON.stringify(outJSON));  
})();




