inherit ROOM;

void create()
{
        set("short", "狼窝");
        set("long", @LONG
这里是密林中的一个大树洞，里面腥味扑鼻，随处都是吃
剩的兽骨残渣。几只瘦得皮包骨头的饿狼正抖擞精神，似乎要
出去觅食了。
LONG);

        set("exits", ([
                "out" : __DIR__"milin4",
        ]));
        set("objects", ([
                "/clone/quarry/lang"  : 2,
                "/clone/quarry/lang2" : 1,
        ]));

        setup();
        //replace_program(ROOM);
}
