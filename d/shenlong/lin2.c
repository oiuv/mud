// lin2.c

inherit ROOM;

string* npcs = ({
	"/clone/beast/jinshe",
	"/clone/beast/qingshe",
	"/clone/beast/jinshe",
	"/clone/beast/qingshe",
	"/clone/beast/fushe",
});
 
void create()
{
        set("short", "灌木林");
        set("long",@LONG
这是一片灌木林。走了不远，你就可以看得见前面的空地了。
LONG);
	set("exits", ([
		"north" : __DIR__"kongdi",
		"south" : __DIR__"lin1",
	]));
	set("objects", ([
		"/clone/beast/dushe" : 1+random(2),
		npcs[random(sizeof(npcs))] : 1,
		npcs[random(sizeof(npcs))] : 1,
		npcs[random(sizeof(npcs))] : 1,
	]) );
	set("outdoors", "shenlong");
	setup();
	replace_program(ROOM);
}
