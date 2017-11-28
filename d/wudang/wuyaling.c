inherit ROOM;

void create()
{
        set("short", "乌鸦岭");
        set("long", @LONG
这是一狭长的脊岭，两侧悬削，一无所傍，但见白云朵朵
冉冉而过，山风拂拂，阵阵袭来。数百只乌鸦正翱翔云际，黑
白分明，蔚成奇观。
LONG);
        set("objects", ([
                "/clone/quarry/niao3" : 3,
        ]));
        set("exits", ([
                "northdown": __DIR__"langmeiyuan",
                "southup"  : __DIR__"sanlaofeng",
        ]));
        set("outdoors", "wudang");
        setup();
        replace_program(ROOM);
}
