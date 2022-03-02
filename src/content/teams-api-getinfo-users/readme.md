This will ask several questions:

**Chat ID** - this is the identifier of the conversation. To find it:

1. Go to [https://teams.microsoft.com](https://teams.microsoft.com)
2. Go to the chat you'd like to export.
3. Copy chat ID from URL. It looks like `19:<uuid of one user>-<uuid of other user>@unq.gbl.spaces`



**Auth token (JWT)** - this is needed for calling Microsoft Graph APIs.

1. Go to [https://developer.microsoft.com/en-us/graph/graph-explorer](https://developer.microsoft.com/en-us/graph/graph-explorer). At the left side, under Authentication, click "Sign In with Microsoft"
2. After having logged in, on the left side (where you clicked for login), click "modify permissions". Enable `Chat.Read` and re-login (like it states).
3. The URL contains the token (`#access_token=<long token goes here>`). Copy this value. Or make any random call in the sandbox and copy the Authorization request header either from the JS console (without `Bearer ` in front of it) or from the "Access token" tab of the Graph Explorer page.



**You can try this for yourself by pasting the following request in a browser**. If you sign in as a Global administrator for an Azure AD tenant, you will be presented with the administrator consent dialog box for the app. (This will be a different app than that in the consent dialog box screenshot shown earlier.)
https://login.microsoftonline.com/common/adminconsent?client_id=6731de76-14a6-49ae-97bc-6eba6914391e&state=12345&redirect_uri=https://localhost/myapp/permissions

----------

## 参考

- [teams-chat-backup](https://github.com/edgraaff/teams-chat-backup)


