// Room: /guiyun/nanxun.c
// Date: Nov.18 1998 by Winder

inherit ROOM;

void create()
{
	set("short", "南浔镇");
	set("long", @LONG
湖州府自来文风甚盛，历代才士辈出，梁时将中国字分为平上去
入四声的沈约，元代书画皆臻极品的赵孟兆都是湖州人氏。当地又以
产笔著名，湖州之笔，徽州之墨，宣城之纸，肇庆端溪之砚，文房四
宝，天下驰名。南浔镇虽是湖州府的一个镇，却比寻常州县还大，镇
上富户极多，著名的富室大族之中有一家姓庄。
LONG );
        set("outdoors", "guiyun");
	set("no_clean_up", 0);
	set("exits", ([
		"north"     : __DIR__"yixing",
	]));
	setup();
	replace_program(ROOM);
}
