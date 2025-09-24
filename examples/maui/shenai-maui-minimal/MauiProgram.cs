using Microsoft.Maui;
using Microsoft.Maui.Hosting;
using CommunityToolkit.Maui; // UseMauiCommunityToolkit
using Shenai.Maui;

namespace Shenai.Maui.Minimal;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .UseMauiCommunityToolkit()
            .UseShenai(); // registers <ShenaiSdkView />

        return builder.Build();
    }
}
