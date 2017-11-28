// /d/xiakedao/road2.c 侠客岛 山路2
inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
小路曲曲折折地通向山顶，脚步声惊起一群飞鸟，扑簌簌地消失
在空中。空气中却有些腥气，路边草丛间不时传来沙沙的轻响，可能
是毒蛇，还是快点离开的好。
LONG );
        set("outdoors", "xiakedao");
        set("exits", ([
                "southup" : __DIR__"road3",
                "northdown" : __DIR__"road1",
                ]));
        set("objects", ([
                "/clone/beast/dushe": 2,
        ]));
        setup();
        replace_program(ROOM);
}
