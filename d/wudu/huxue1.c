inherit ROOM;

void create()
{
        set("short", "虎穴");
        set("long", @LONG
这里是个隐藏在密林里的岩洞，里面腥味扑鼻，随处都是
吃剩的兽骨。几只威风凛凛的大老虎正躺在洞口懒懒的晒太阳。
LONG);

        set("exits", ([
                "south" : __DIR__"huxue2",
                "out" : __DIR__"milin7",
        ]));
        set("objects", ([
                "/clone/quarry/laohu" : 2,
        ]));

        setup();
        //replace_program(ROOM);
}
