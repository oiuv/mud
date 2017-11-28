inherit ROOM;

void create()
{
        set("short", "石道");
        set("long", @LONG
一路上日月教教众把守严密，经过三处山道，来到一处水
滩之前，西面有一道石阶通往水滩。
LONG);
        set("outdoors", "heimuya");
        set("exits", ([
            	"northdown" : __DIR__"xingxingtan",
            	"south" : __DIR__"shidao1",
        ]));
        set("objects", ([
            	__DIR__"npc/dizi3" : 2,
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
