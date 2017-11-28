inherit ROOM;

void create()
{
        set("short", "黑风口");
        set("long", @LONG
这里是密林中的险恶之境周围是为茂密的松林，不见天光。
林中传来野兽饥饿之极的嘶吼。四处有不知名草菰和野果，可
你一点也不敢尝尝。林木幽暗深邃，似乎暗藏杀机。你到了此
处，心胆俱裂，只想快点离开。
LONG );
        set("exits", ([
                "east"     : __DIR__"xiaotianchi",
                "westdown" : __DIR__"milin3",
        ]));
        set("objects", ([
                "/clone/quarry/xiong" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
