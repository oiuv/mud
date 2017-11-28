#include <ansi.h>
#include <room.h>
inherit ROOM;

varargs STATIC_FUNC_TAG void
create_food(string nmstr, string* idlist, string longstr)
{
        object obj;

        obj = new(__DIR__"obj/food");
        obj->set_name(nmstr, idlist);
        if (longstr)
              obj->set("long", longstr);
        else
              obj->set("long", GRN "一盘热气腾腾，香喷喷的" + nmstr +
                               NOR + GRN "。\n" NOR);
        obj->move(this_object());
}

varargs STATIC_FUNC_TAG void
create_water(string nmstr, string* idlist, string cup, string longstr)
{
        object obj;

        obj = new(__DIR__"obj/water");
        obj->set_name(cup, idlist);
        if (longstr)
              obj->set("long", longstr);
        else
              obj->set("long", YEL "一杯美味可口的" + nmstr + NOR +
                               YEL "。\n" NOR);
        obj->set("liquid/name", nmstr);
        obj->move(this_object());
}

varargs STATIC_FUNC_TAG void
create_wine(string nmstr, string* idlist, string cup, string longstr)
{
        object obj;

        obj = new(__DIR__"obj/wine");
        obj->set_name(cup, idlist);
        if (longstr)
              obj->set("long", longstr);
        else
              obj->set("long", RED "一杯醇正芬芳的" + nmstr + NOR +
                               RED "。\n" NOR);
        obj->set("liquid/name", nmstr);
        obj->move(this_object());
}

void create()
{
        set("short", "玫瑰宴厅");
        set("long",
"这里是醉仙楼的玫瑰宴厅。你走进门，绕过了一道淡绿绸
屏风，迎面的墙上挂着一副" NOR + HIR "『玫瑰含露图』" NOR"，工笔彩绘，状极
清雅，气质卓绝。厅内陈列奢华，正中央一张雕花楠木青漆嵌
玉大圆桌。四周十二张镶银象牙扶手红木椅，杯碗勺箸，入眼
生辉，桌上铺着份菜单(menu)。
");
        set("exits", ([
		"west" : __DIR__"zxlpath",
        ]));
        set("no_sleep_room",1);

        set("item_desc", ([
                "menu" :  WHT "\n\n        ※※※※※※※※※※※※※※※\n"
                              "        ※                          ※\n"
                              "        ※         " NOR + HIR "承办酒席" NOR + WHT "         ※\n"
                              "        ※                          ※\n"
                              "        ※  " NOR + HIW "祝寿宴" NOR + WHT "：" NOR + HIY "order birthday" NOR + WHT "  ※\n"
                              "        ※                          ※\n"
                              "        ※                " NOR + YEL "二两黄金" NOR + WHT "  ※\n"
                              "        ※                          ※\n"
                              "        ※  " NOR + HIW "订婚宴" NOR + WHT "：" NOR + HIY "order marry" NOR + WHT "     ※\n"
                              "        ※                          ※\n"
                              "        ※                " NOR + YEL "三两黄金" NOR + WHT "  ※\n"
                              "        ※                          ※\n"
                              "        ※  " NOR + HIW "群豪宴" NOR + WHT "：" NOR + HIY "order player" NOR + WHT "    ※\n"
                              "        ※                          ※\n"
                              "        ※                " NOR + YEL "五两黄金" NOR + WHT "  ※\n"
                              "        ※                          ※\n"
                              "        ※  " NOR + HIW "结  束" NOR + WHT "：" NOR + HIY "order end" NOR + WHT "       ※\n"
                              "        ※                          ※\n"
                              "        ※                          ※\n"
                              "        ※                          ※\n"
                              "        ※※※※※※※※※※※※※※※\n\n\n" NOR,
        ]));
	set("no_clean_up", 0);
        setup();
        set("no_user", 1);
}

void init()
{
        object me;

        add_action("do_order", "order");
        add_action("do_broadcast", "broadcast");
        if (query("order_owner"))
	{
                me = this_player();
                me->set("food", me->query("food") / 2);
                me->set("water", me->query("water") / 2);
        }
}

int do_broadcast(string arg)
{
        string type;
        string mesg;
        object me;

        me = this_player();

        if (query("order_owner") != me->query("id"))
                return 0;

        type = query("order_type");

        if (type == "marry")
	{
                mesg = me->name() + "现在在醉仙楼玫瑰厅举行订婚酒宴。\n\n";
        } else
	if (type == "birthday")
	{
                mesg = me->name() + "现在在醉仙楼玫瑰厅举行生辰寿宴。\n\n";
        } else
	if (type == "player")
	{
                mesg = me->name() + "现在在醉仙楼玫瑰厅宴请各路英雄豪杰。\n\n";
        }
        message("channel:chat", HIW "【江湖通告】" + mesg + NOR, users());
        return 1;
}

int do_order(string arg)
{
        object me, env;
        object* oblist;
        string mesg;
        int idx;

        me = this_player();
        env = this_object();
        mesg = query("order_owner");
        if (mesg
           && (arg == "end")
           && (mesg == me->query("id")))
	{
                mesg = "玫瑰厅的宴会结束了。\n\n";
                message("channel:chat", HIW "【江湖通告】" + mesg + NOR, users());

                delete("order_owner");
                delete("order_type");
                oblist = all_inventory(env);

                for(idx = 0; idx<sizeof(oblist); idx++)
		{
                        if (! objectp(oblist[idx]))
                                continue;
                        if (userp(oblist[idx]))
                                continue;
                        destruct(oblist[idx]);
                }
                return 1;
        }
        if (mesg)
                return notify_fail("这里已经被人包租了。\n");
	        notify_fail("你没有足够的钱或零钱不够。\n");

        if (arg == "marry")
	{
                mesg = me->name() + "现在在醉仙楼玫瑰厅举行订婚酒宴。\n\n";

                if (me->can_afford(30000) == 0)
                        return 0;

                me->pay_money(30000);

                create_water(HIG "龙井茶" NOR, ({ "tea" }), MAG "紫砂茶盅" NOR);
                create_water(RED "普洱茶"NOR, ({ "tea" }), WHT"水晶盏" NOR);

                create_wine(WHT "米酒" NOR, ({ "wine" }), HIW "搪瓷杯" NOR);
                create_wine(GRN "竹叶青" NOR, ({ "wine" }), GRN "翡翠杯" NOR);
                create_wine(YEL "绍兴黄酒" NOR, ({ "wine" }), HIY "象牙杯" NOR);
                create_wine(HIR "女儿红" NOR, ({ "wine" }), MAG "紫檀杯" NOR);
                create_wine(WHT "茅台酒" NOR, ({ "wine" }), YEL "鎏金杯" NOR);
                create_wine(RED "桂花酒" NOR, ({ "wine" }), WHT "琉璃杯" NOR);

                create_food(YEL "香酥花生" NOR, ({"peanut"}));
                create_food(HIR "酒糟红枣" NOR, ({"jujube"}));
                create_food(RED "喜糖" NOR, ({"sugar"}));
                create_food(HIW "奶油瓜子" NOR, ({"melon seeds", "seeds"}));
                create_food(HIG "碧螺春卷" NOR, ({ "spring roll", "roll" }));
                create_food(HIC "香片蒸鱼" NOR, ({"fish"}));
                create_food(HIW "麻辣手撕鸡" NOR, ({"chicken"}));
                create_food(HIR "干煸尤鱼" NOR, ({"fish"}));
                create_food(HIY "东北水饺" NOR, ({ "dumpling" }));
                create_food(RED "麻辣火锅" NOR, ({ "chafing dish", "dish" }));
                create_food(HIR "油煎螃蟹" NOR, ({ "crab" }));
                create_food(HIY "粉蒸肉" NOR, ({ "meat" }));
                create_food(YEL "家常豆腐" NOR, ({ "bean curd" }));
        } else
	if (arg == "birthday")
	{
                mesg = me->name() + "现在在醉仙楼玫瑰厅举行生辰寿宴。\n\n";

                if (me->can_afford(20000) == 0)
                        return 0;

                me->pay_money(20000);

                create_water(GRN "云雾茶" NOR, ({ "tea" }), MAG "紫砂茶盅" NOR);
                create_water(HIG "君山银针" NOR, ({ "tea" }), RED "红泥盏" NOR);
                create_water(HIW "鲜奶" NOR, ({ "milk" }), WHT "玻璃杯" NOR);

                create_wine(RED "陈年花雕" NOR, ({ "wine" }), HIW "宋瓷杯" NOR);
                create_wine(WHT "五粮液" NOR, ({ "wine" }), WHT "玻璃杯" NOR);
                create_wine(WHT "米酒" NOR, ({ "wine" }), HIW "搪瓷杯" NOR);
                create_wine(HIR "杜康酒" NOR, ({ "wine" }), HIG "青铜爵" NOR);
                create_wine(HIW "透瓶香" NOR, ({ "wine" }), WHT "琉璃杯" NOR);

                create_food(HIY "德州扒鸡" NOR, ({ "chicken" }));
                create_food(HIG "碧螺春卷" NOR, ({ "spring roll", "roll" }));
                create_food(HIC "香片蒸鱼" NOR, ({"fish"}));
                create_food(YEL "咖喱饭" NOR, ({"rice"}));
                create_food(RED "蚝油肉片" NOR, ({"fish meat", "meat"}));
                create_food(RED "羊肉串" NOR, ({ "mutton" }));
                create_food(HIR "重庆火锅" NOR, ({ "chafing dish", "dish" }));
                create_food(HIY "北京烤鸭" NOR, ({ "duck" }));
                create_food(YEL "粉蒸肉" NOR, ({ "meat" }));
                create_food(HIW "四喜豆腐" NOR, ({ "bean curd" }));
        } else
	if (arg == "player")
	{
                mesg = me->name() + "现在在醉仙楼玫瑰厅宴请各路英雄豪杰。\n\n";

                if (me->can_afford(50000) == 0)
                        return 0;

                me->pay_money(40000);

                create_water(HIW "羊奶" NOR, ({ "milk" }), CYN "青花碗" NOR);
                create_water(GRN "云雾茶" NOR, ({ "tea" }), MAG "紫砂茶盅" NOR);
                create_water(GRN "碧螺春" NOR, ({ "tea" }), MAG "紫砂盏" NOR);
                create_water(HIG "君山银针" NOR, ({ "tea" }), RED "红泥盏" NOR);
                create_water(HIR "红毛尖" NOR, ({ "tea" }), CYN "青泥盏" NOR);

                create_wine(HIW "汾酒" NOR, ({ "wine" }), WHT "羊脂白玉杯" NOR);
                create_wine(WHT "关外白酒" NOR, ({ "wine" }), YEL "犀角杯" NOR);
                create_wine(RED "葡萄酒" NOR, ({ "wine" }), HIW "夜光杯" NOR);
                create_wine(WHT "高粱酒" NOR, ({ "wine" }), CYN "青铜爵" NOR);
                create_wine(HIG "百草酒" NOR, ({ "wine" }), RED "古藤杯" NOR);
                create_wine(HIR "状元红" NOR, ({ "wine" }), WHT "古瓷杯" NOR);
                create_wine(GRN "梨花酒" NOR, ({ "wine" }), HIG "翡翠杯" NOR);
                create_wine(HIW "玉露酒" NOR, ({ "wine" }), WHT "琉璃杯" NOR);

                create_food(YEL "叫花鸡"NOR, ({ "chicken" }));
                create_food(HIW "四喜豆腐" NOR, ({ "bean curd" }));
                create_food(HIG "碧螺春卷" NOR, ({ "spring","roll" }));
                create_food(HIC "香片蒸鱼" NOR, ({"fish"}));
                create_food(RED "羊肉串" NOR, ({ "mutton" }));
                create_food(HIY "花枝饭卷" NOR, ({"rice"}));
                create_food(HIR "鱼香肉丝" NOR, ({"fish meat", "meat"}));
                create_food(HIY "德州扒鸡" NOR, ({ "chicken" }));
                create_food(RED "麻辣火锅" NOR, ({ "chrafing dish", "dish" }));
                create_food(HIY "北京烤鸭" NOR, ({ "duck" }));
                create_food(HIW "白斩鸡" NOR, ({ "chicken" }));
                create_food(YEL "粉蒸肉" NOR, ({ "meat" }));
                create_food(HIR "重庆火锅" NOR, ({ "chafing dish", "dish" }));
                create_food(HIR "麻婆豆腐" NOR, ({ "bean curd" }));
                create_food(RED "蚝油肉片" NOR, ({"fish meat", "meat"}));
                create_food(YEL "咖喱饭" NOR, ({"rice"}));
                create_food(HIW "麻辣手撕鸡" NOR, ({"chicken"}));
                create_food(HIR "干煸尤鱼" NOR, ({"fish"}));
                create_food(HIY "东北水饺" NOR, ({ "dumpling" }));
        }
        else
	{
                return notify_fail("你要定什么酒席?\n");
        }
        message("channel:chat", HIW "\n【江湖通告】" + mesg + NOR, users());
        set("order_owner", me->query("id"));
        set("order_type", arg);
        return 1;
}

int valid_leave(object me, string dir)
{
        if (me->query("id") != query("order_owner"))
                return 1;
        return notify_fail(HIC "请先用 order end 结束宴会后才能离开。\n" NOR);
}


