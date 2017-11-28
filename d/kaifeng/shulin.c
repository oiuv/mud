inherit ROOM;

void create()
{
        set("short", "树林");
        set("long", @LONG
一片杂树林，落叶掉了满地，斑驳的枝叶显露出天气的无
情。绿色的小草就从树之间的空隙长出来。林中点点的都是绿
色。小路穿过树林不远就是禹王台。东南是中州方向。
LONG);
        set("no_clean_up", 0);

        set("exits", ([
		"southeast":__DIR__"guandao1",
		"northwest" : __DIR__"dadao1",
		"east" : __DIR__"yuwang",
	]));
        set("outdoors", "kaifeng");

        setup();
        replace_program(ROOM);
}
