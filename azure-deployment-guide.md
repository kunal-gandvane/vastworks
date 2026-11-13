# Deploying VastWorks on Microsoft Azure

You have two primary options to run VastWorks on Azure:

---

## Option 1: Azure Static Web Apps (Recommended & Free Tier)
This is the fastest, lowest-cost (free tier available), and highest-performance method with global CDN distribution and free automatic SSL for your custom domain.

### Steps via Azure Portal:
1. Push your `vastworks` project to a **GitHub** repository.
2. Go to the [Azure Portal](https://portal.azure.com) and search for **Static Web Apps**.
3. Click **Create**:
   * **Subscription**: Your Azure subscription
   * **Resource Group**: Select or create one (e.g. `rg-vastworks`)
   * **Name**: `vastworks-web`
   * **Plan type**: `Free`
   * **Deployment details**: Select **GitHub** and authorize your account.
   * **Repository**: Select your `vastworks` repo and `main` branch.
4. In **Build Details**:
   * **Build Presets**: Select `Custom`
   * **App location**: `/public`
   * **Api location**: *(leave empty)*
   * **Output location**: *(leave empty)*
5. Click **Review + Create** -> **Create**.
6. Azure will automatically generate a GitHub Actions workflow and deploy your site in ~60 seconds with an `azurestaticapps.net` URL.
7. Under **Custom domains** in the Azure portal, you can link your custom domain (e.g. `vastworks.ai`) with free SSL.

---

## Option 2: Azure App Service (Full-Stack Node.js)
If you want to run the Node.js Express server (`server.js`) on a dedicated Linux instance:

### Using Azure CLI:
```powershell
# 1. Login to Azure
az login

# 2. Create resource group
az group create --name rg-vastworks --location eastus

# 3. Create App Service plan
az appservice plan create --name plan-vastworks --resource-group rg-vastworks --sku B1 --is-linux

# 4. Deploy directly from the project directory
cd C:\Users\Kunal\.gemini\antigravity\scratch\vastworks
az webapp up --name vastworks-app --resource-group rg-vastworks --runtime "NODE:20-lts"
```

---

## Option 3: Docker Container
A production `Dockerfile` is included in the project root:

```powershell
docker build -t vastworks .
docker run -p 8080:8080 vastworks
```
You can deploy this container directly to **Azure Container Apps** or **Azure App Service for Containers**.
