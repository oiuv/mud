inherit ROOM;

void create()
{
        set("short", "南门");
        set("long", @LONG
这里便是昆明的南门，高高的城楼上写着大大的南门两个
字，由此南去，就是滇池了，出入南门的人很少，只有些渔民
不时提着新鲜的鱼进城来卖。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "south" : __DIR__"htroad1",
                "north" : __DIR__"nandajie2",
        ]));
        set("objects", ([
                "/d/beijing/npc/ducha" : 1,
                "/d/city/npc/bing" : 4,
        ]));
        setup();
        replace_program(ROOM);
}
