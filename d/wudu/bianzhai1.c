inherit ROOM;

void create()
{
        set("short", "边寨风情");
        set("long", @LONG
这里已是苗疆地界，只觉得山清水秀，风景与中原大不相同。你
走在路上，不时会碰到少男少女在路边田野里载歌载舞，顿时只觉心
情舒畅，但愿终老此乡。南面就是有名的黑森林了。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "south" : __DIR__"milin8",
                "west" : __DIR__"bianzhai2",
                "southwest" : __DIR__"bianzhai3",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        setup();
}

