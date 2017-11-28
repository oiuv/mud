inherit ROOM;

void create()
{
        set("short", "百木园");
        set("long", @LONG
这里是梅庄的百木园，你一走到这里，就象走到了一个连绵无尽
的小森林一样，这里无数的松树，柏树，白杨，还有很多叫不出来名
字的异种苗木，你走在其中，只想把这片树林尽情的欣赏一遍，永不
出去才好。
LONG
        );
        set("exits", ([
            "west" : __DIR__"senlin1",
            "east" : __DIR__"qhpo",
        ]));
        set("outdoors", "meizhuang");
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
