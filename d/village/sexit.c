inherit ROOM;

void create()
{
        set("short", "南村口");
        set("long", @LONG
这里是华山脚下，虽然远离县城，却没有什麽山贼草寇在
附近出没。西面是一个小村庄，看来村子里人家不多，村民们
过着日出而作，日落而息的宁静生活。穿过这个小村子，就是
上华山的山路了。
LONG);
        set("exits", ([
                "north" : __DIR__"sroad1",
                "south" : __DIR__"hsroad3",
        ]));
        set("objects", ([
                "/clone/quarry/gou" : 1,
        ]));
        set("outdoors", "village");

        setup();
        replace_program(ROOM);
}
