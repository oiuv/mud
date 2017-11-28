inherit ROOM;

void create()
{
	set("short","茶花园");
	set("long",@LONG
大理茶花冠绝天下，镇南王府的茶花自然更非凡品。你
站在茶花园中，北面是一座小山，山上栽满了常青乔木。地
上长草委地，密密层层的。东面有一个小小庭院，西边望去
仍是一片万紫千红。
LONG);
	set("outdoors", "dali");
	set("exits", ([
	    	"south"   : __DIR__"chahua6",
	    	"northup" : __DIR__"chahua9",
	    	"east"    : __DIR__"chahua10",
	    	"west"    : __DIR__"chahua8",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

