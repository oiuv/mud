inherit ROOM;

void create()
{
        set("short", "边寨风情");
        set("long", @LONG
这里已是苗疆地界，只觉得山清水秀，风景与中原大不相同。你
走在路上，不时会碰到少男少女在路边田野里载歌载舞，顿时只觉心
情舒畅，但愿终老此乡。东面有一条江水拦住去路。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"jiang1",
                "northeast" : __DIR__"bianzhai1",
                "north" : __DIR__"bianzhai2",
        ]));

        setup();
}
