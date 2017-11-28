inherit ROOM;

void create()
{
        set("short", "阿诗玛");
        set("long", @LONG
这里是石林著名的阿诗玛峰，相传很就以前，美丽的哈尼
族姑娘阿诗玛在此等侯他的阿黑哥，然而阿黑却被地主老财杀
害了，阿诗玛等啊等，始终没有等来心爱的情郎，终究化作了
一座石峰，永远的守侯下去。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "north" : __DIR__"shilin", 
                "west"  :__DIR__"shilin2",
        ]));
        set("objects", ([
                "/d/wudu/npc/youngboy" : 1,
        ]));
        setup();
        replace_program(ROOM);
}