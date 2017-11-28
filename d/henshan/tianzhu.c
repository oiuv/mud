inherit ROOM;

void create()
{
        set("short", "天柱峰");
        set("long", @LONG
你爬上衡山五峰之一的天柱峰，四望群山缥缈云雾中，每
每天阴地湿时候，这里就是天柱云气的所在了。衡山派绝学天
柱剑法便是从中领悟出来的。
LONG);
        set("exits", ([ 
                "westdown"   : __DIR__"shanlu10",
                "eastdown"   : __DIR__"shanlu7",
        ]));

        set("objects", ([
                CLASS_D("henshan") + "/lu" : 1,
        ]));    

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}

