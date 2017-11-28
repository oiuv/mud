inherit ROOM;

void create()
{
        set("short", "榔梅园");
        set("long", @LONG
眼前豁然开朗，你轻松地走在榔梅园的小路上。两边是桃
树林，树上盛开着粉红的桃花，红云一片，望不到边。不时有
蜜蜂「嗡嗡」地飞过，消失在在花丛中；几只猴子在树上互相
追逐着，叽叽喳喳地争抢桃子。远处是高高的天柱峰。
LONG);
        set("outdoors", "wudang");

        set("exits", ([
                "east" : __DIR__"lameigt",
        ]));
        set("objects", ([
                CLASS_D("wudang") + "/shouyuan" : 1,
        ]));
        setup();
}
