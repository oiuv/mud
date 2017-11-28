inherit ROOM;

void create()
{
        set("short", "大门");
        set("long",@LONG
你来到了天龙寺大门前，只见气势恢弘的两个大门柱上刻有一付对联
( duilian )，红漆覆字，颇有点拨众生之意。抬头上望，门楣上一块黑
木大匾，上题“崇圣寺”三个大字，笔意苍松。此乃正式寺名，但大理百
性叫惯了，都称之为“天龙寺”。
LONG );
        set("outdoors", "tianlongsi");
        set("exits", ([
                "south" : __DIR__"talin",
                "north" : "/d/dali/hongsheng",
        ]));
	set("item_desc",([
		"duilian" : "\n    心性无染本自圆成　但离妄缘即如如佛\n\n",
	]));	
        set("objects",([
                "/d/wudang/npc/guest" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
