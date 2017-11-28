inherit ROOM;

void create()
{
        set("short", "虎头岩");
        set("long", @LONG
一块巨大的岩石看上去好象一个虎头正张大了血盆大口咆
哮，虎身隐藏在草木丛中。
LONG);
        set("objects", ([
                "/clone/quarry/laohu" : 1,
        ]));
        set("exits", ([
                "northdown" : __DIR__"wulaofeng",
                "southup"   : __DIR__"chaotiangong",
        ]));

        set("outdoors", "wudang");
        setup();
        replace_program(ROOM);
}
