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
这是一片灌木林。你没有想到这样一个孤岛上竟有这样大一片灌
木林(bush)，不由感到非常吃惊。前面根本没有路，四周的密林中长
满了杂草。
LONG);

	set("exits", ([
	    "south" : __DIR__"haitan",
	]));

	set("item_desc", ([
	    "bush" : "这片灌木林太深了,要想过去恐怕只有砍出一条路了(kan)。\n",
	]));

	set("objects", ([
		"/clone/beast/dushe" : 1 + random(2),
		npcs[random(sizeof(npcs))] : 1,
		npcs[random(sizeof(npcs))] : 1,
		npcs[random(sizeof(npcs))] : 1,
	]));
        set("outdoors", "shenlong");
        setup();
}

void init()
{
        add_action("do_kan", "kan");
}

int do_kan(string arg)
{
        object weapon;
        object me;

        if (arg != "bush")
                return notify_fail("你要砍什么？\n" ) ;

        me = this_player();
	if (! objectp(weapon = me->query_temp("weapon")))
		return notify_fail("不用武器恐怕不行吧！\n");

        if (weapon->query("skill_type") != "blade" &&
            weapon->query("skill_type") != "sword")
                return notify_fail(weapon->name() + "也能用来砍东西？\n");

	message_vision("$N抽出兵刃，对着灌木丛就是一阵乱砍。\n", me);

        if (me->query("neili") > 100)
        {
                set("exits/north", __DIR__"lin2");
                message_vision("$N累得气喘吁吁,终于砍出一条小路。\n", me);
                me->add("neili", -50);
                remove_call_out("close");
                call_out("close", 20);
	} else	
	{
                message_vision("$N累得气喘吁吁,也没砍开一条路来。\n", me);
	        me->set("neili", 0);
	}
        return 1;
}

void close()
{
        message("vision", "灌木丛渐渐合拢起来,终于又恢复了原状。\n",
                this_object());
        delete("exits/north");
}
