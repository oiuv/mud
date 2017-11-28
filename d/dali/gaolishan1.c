inherit ROOM;

void create()
{
        set("short", "高黎山东坡");
        set("long", @LONG
这里是高黎山的东坡，向东俯视奔淌而过的东泸水，远远
眺望跨谷相对的碧罗雪山。此去再向西全是崇山峻岭，人烟稀
少。山间林深兽多，乌夷族的猎人经常进山打猎。
LONG);
        set("objects", ([
                "/clone/quarry/yang2" : 1,
        ]));
        set("outdoors", "dali");
        set("exits", ([
                "west"     : __DIR__"gaolishan2",
                "eastdown" : __DIR__"atoubu",
        ]));
        setup();
        replace_program(ROOM);
}
