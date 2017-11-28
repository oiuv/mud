inherit ROOM;

void create()
{
        set("short", "般若台");
        set("long",@LONG
这是个普通的石台，相传当年佛祖曾降临此台传法。再往南去就是本
寺重地——牟尼堂。江湖中传言天龙寺的镇寺之宝——六脉神剑谱就藏于
此中。
LONG );
	set("exits", ([
		"south" : __DIR__"munitang",
		"north" : __DIR__"doushuai",
	]));
	setup();
}

string long()
{
        if (! stringp(query("exits/south")))
                return query("long") + "    奇怪的是大门紧"
                       "闭，不知道里面怎么回事。\n";

        return query("long");
}
