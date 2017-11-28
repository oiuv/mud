//Room: tea-shop.c

inherit ROOM;

void create()
{
        set("short", "茶馆");
        set("long", @LONG
这间茶房是长安的闲人杂聚的场所，里面横七竖八的百放着一些木
制的桌椅。一个说书的老人正在滔滔不绝的讲着什么。一些茶客一边品
茶，一边听书，一边绘声绘色交头接耳，如果你要想打听江湖掌故和谣
言，来这里准没错。
LONG);
        set("exits", ([ /* sizeof() == 1 */
        	"south" : __DIR__"qixiang2",
        ]));
        set("objects", ([
        	__DIR__"npc/teawaiter" : 1,
        	__DIR__"npc/laoren" :1,
        ]) );

        setup();
        replace_program(ROOM);
}
