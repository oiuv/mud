inherit ROOM;

void create()
{
        set("short", "桃园小路");
        set("long", @LONG
眼前豁然开朗，你轻松地走在桃园边的小路上。路上落英
缤纷，一边是桃树林，盛开着粉红的桃花，红云一片，望不到
边。还可以看见蜜蜂「嗡嗡」地在花间飞上飞下忙个不停，间
或传来猿猴的叽咋声。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
                "west" : __DIR__"tyroad11",
                "east" : __DIR__"tyroad13",
        ]));
        set("objects", ([
                "/clone/quarry/hou" : 1
        ]));
        setup();
        replace_program(ROOM);
}
