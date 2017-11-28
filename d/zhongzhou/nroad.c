inherit ROOM;

void create()
{
        set("short", "石板大道");
        set("long", @LONG
这儿靠中州府不远，路上行人来往不断，你的眉头也舒展
了开来，步子也越迈越大。北面就是中州府的南城门了。
LONG);
        set("exits", ([
  		"south" : __DIR__"toyy",
  		"north" : __DIR__"nanmeng",
	]));

	set("outdoors", "zhongzhou");
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
