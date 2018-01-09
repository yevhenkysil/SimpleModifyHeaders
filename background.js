
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. 
 *
 * @author didierfred@gmail.com
 * @version 0.1
 */


"use strict";

var targetPage = "https://httpbin.org/*";
var modifyTable = [];
var started = "off";

// If no table stored , use and store a default one
if (!localStorage.getItem('modifyTable')) 
	{
	modifyTable = [
		["add","test_header_name","test_header_value","on"],
		];
	localStorage.setItem("modifyTable",JSON.stringify(modifyTable));
	}
else 
	{
	modifyTable=JSON.parse(localStorage.getItem("modifyTable"));
	}

// If no target page stored , use a default one 
if (!localStorage.getItem('targetPage')) localStorage.setItem('targetPage',targetPage);
else targetPage = localStorage.getItem('targetPage');

// If no started value stored , use a default one 
if (!localStorage.getItem('started')) localStorage.setItem('started',started);
else started = localStorage.getItem('started');

if (started=="on") 
		{
		addListener();
		browser.browserAction.setIcon({ path: "icons/modify-green-32.png"});
		}


// listen for change in configuration or start/stop 
browser.runtime.onMessage.addListener(notify);


/*
* Rewrite the header (add , modify or delete)
*
*/
function rewriteHeader(e) 
{

  for (var to_modify of modifyTable)
	{
		if (to_modify[3]=="on")
			{
			if (to_modify[0]=="add")  
				{
					var new_header = {"name" :to_modify[1],"value":to_modify[2]};
					e.requestHeaders.push(new_header);
				}
			else if (to_modify[0]=="modify")
				{
				for (var header of e.requestHeaders) 
					{
					if (header.name.toLowerCase() == to_modify[1].toLowerCase()) header.value = to_modify[2];
					}
				}
			else if (to_modify[0]=="delete")
				{
				var index = -1;
			
				for (var i=0; i < e.requestHeaders.length; i++)
					{
				 	if (e.requestHeaders[i].name.toLowerCase() == to_modify[1].toLowerCase())  index=i;
					}
				if (index!=-1) 
					{
					e.requestHeaders.splice(index,1);	
					}
				}
			}
	}
	
  return {requestHeaders: e.requestHeaders};
}



/*
* Listen for message form config.js
* if message is reload : reload the configuration 
* if message is on : start the modify header 
* if message is off : stop the modify header
*
**/
function notify(message) 
	{
	if (message=="reload") 
		{
		modifyTable=JSON.parse(localStorage.getItem("modifyTable"));
		targetPage = localStorage.getItem('targetPage');
		if (started=="on")
			{		
			browser.webRequest.onBeforeSendHeaders.removeListener(rewriteHeader);
			addListener();
			}
		}

	else if (message=="off")
		{
		browser.webRequest.onBeforeSendHeaders.removeListener(rewriteHeader);
		browser.browserAction.setIcon({ path: "icons/modify-32.png"});
		started="off";
		}

	else if (message=="on")
		{
		addListener();
		browser.browserAction.setIcon({ path: "icons/modify-green-32.png"});
		started="on";
		}
  	}

/*
* Add rewriteHeader as a listener to onBeforeSendHeaders, only for the target page.
* Make it "blocking" so we can modify the headers.
*/
function addListener()
	{
	browser.webRequest.onBeforeSendHeaders.addListener(rewriteHeader,
                                          {urls: [targetPage]},
                                          ["blocking", "requestHeaders"]);
	}


