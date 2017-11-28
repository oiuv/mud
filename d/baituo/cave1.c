inherit ROOM;

void create()
{
        set("short", "岩洞内");
        set("long", @LONG
这里是岩洞内部，洞顶上悬挂着洁白的钟乳石。
LONG);
        set("exits",([
                "out" : __DIR__"cave",
        ]));
        set("objects",([
                "/clone/beast/yanjingshe" : random(2),
                "/clone/beast/wangshe" : random(2),
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
