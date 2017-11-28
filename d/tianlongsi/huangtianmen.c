inherit ROOM;

void create()
{
        set("short", "晃天门");
        set("long",@LONG
这是出入前后寺的必经之路。往南望去，可见后寺中亭台楼阁规模宏
大，构筑精丽，宅地连云，其气势之盛更胜于五台，普陀等诸处佛门胜地
的名山大寺。
LONG );
	set("outdoors","tianlongsi");
        set("exits", ([
		"south": __DIR__"yaotai",    			
	        "west" : __DIR__"wulege",
		"east" : __DIR__"wuchangge",
	]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
