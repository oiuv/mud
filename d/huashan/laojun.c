// laojun.c

inherit ROOM;

void create()
{
        set("short", "老君沟");
	set("long", @LONG
爬过两个要命的悬崖，可在这里稍作歇息。老君沟是一条半里多长的
山沟，相传为太上老君到此，见无路可通，因而套上大青牛用铁犁犁出了
这条沟作为登山通道。
LONG );
        set("exits", ([ /* sizeof() == 2 */
            "westdown" : __DIR__"pingxinshi",
            "southup"  : __DIR__"husun",
        ]));
        set("objects", ([
             "/kungfu/class/huashan/lao" : 1,
        ]));

        set("outdoors", "huashan" );

        setup();

}
 
int valid_leave(object me, string dir)
{
        object guarder;

        if (! objectp(guarder = present("lao denuo", this_object())))
                return 1;

        if (dir == "southup")
                return guarder->permit_pass(me, dir);

        return 1;
}
