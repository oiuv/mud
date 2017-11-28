inherit ROOM;

void create()
{           
        set("short", "桃园");
        set("long", @LONG
眼前豁然开朗，你轻松地走在桃园的小路上。两边是桃树
林，树上盛开着粉红的桃花，红云一片，望不到边。不时有蜜
蜂「嗡嗡」地飞过，消失在在花丛中；几只猴子在树上互相追
逐着，叽叽喳喳地争抢桃子。远处是高高的天柱峰。
LONG );
        set("outdoors", "wudang");

        set("exits", ([
                "east" : __DIR__"gyroad1",
                "west" : __DIR__"tyroad12",
        ]));
        set("objects", ([
                CLASS_D("wudang") + "/shouyuan" : 1,
        ]));
        setup();
}