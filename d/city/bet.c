#include <ansi.h>
inherit ROOM;

int room_status = 0;
int *big = allocate(2);
int *res = allocate(2);

int random2 (int i)
{
        return (random(i) + uptime()) % i;
}

mapping gutous = ([ 
	"tc" : "头彩",
        "sd" : "双对",
        "qx" : "七星",
        "sx" : "散星",
 ]); 

void create()
{
        set("short", "赌场");
        set("long", @LONG
大厅里摆满大大小小的赌桌，只要能说出名的赌具，这里
都有。进来这里你首先听到的就是少女们吃吃的笑声和男人们
的吹牛声，掷骰子声……在这里，你几乎就可以听到世上所有
不规矩的声音。墙上挂着一块牌子(paizi)。
LONG);
        set("exits", ([
                "south" : __DIR__"duchang",
        ]));
        set("item_desc", ([
                "paizi" : WHT "        ※※※※※※※※※※※※※※※※※※※\n"
                              "        ※                                  ※\n"
                              "        ※             " NOR + HIW "赌博规则" NOR + WHT "             ※\n"
                              "        ※                                  ※\n"
                              "        ※                                  ※\n"
                              "        ※  " NOR + HIW "头彩" NOR + WHT " <" NOR + HIC "tc" NOR + WHT "> 骰数由每次开盘前确定  ※\n"
                              "        ※            赔率：一赢三十六      ※\n"
                              "        ※                                  ※\n"
                              "        ※  " NOR + HIW "双对" NOR + WHT " <" NOR + HIC "sd" NOR + WHT "> 两骰号相同，且为偶数  ※\n"
                              "        ※            赔率：一赢十二        ※\n"
                              "        ※                                  ※\n"
                              "        ※  " NOR + HIW "七星" NOR + WHT " <" NOR + HIC "qx" NOR + WHT "> 两个骰数之和为七      ※\n"
                              "        ※            赔率：一赢六          ※\n"
                              "        ※                                  ※\n"
                              "        ※  " NOR + HIW "散星" NOR + WHT " <" NOR + HIC "sx" NOR + WHT "> 和为三，五，九，十一  ※\n"
                              "        ※            赔率：一赢三          ※\n"
                              "        ※                                  ※\n"
                              "        ※  " NOR + HIW "开赌" NOR + WHT "：                          ※\n"
                              "        ※                                  ※\n"
                              "        ※                                  ※\n"
                              "        ※   " NOR + HIY "bet  " NOR + HIC "压盘种类" NOR + HIY "  数量  货币种类" NOR + WHT "  ※\n"
                              "        ※                                  ※\n"
                              "        ※                                  ※\n"
                              "        ※                                  ※\n"
                              "        ※※※※※※※※※※※※※※※※※※※\n\n\n" NOR,
        ]));
        set("objects", ([
                "/d/beijing/npc/duke" : 2,
                "/d/changan/npc/zhuangjia" : 1,
        ]));
        set("no_fight", 1);
        setup();
}
void init()
{
	if (! interactive(this_player()))
		return;

        add_action("do_bet", "bet");

        if (room_status > 0)
        	return;

        remove_call_out("gamble_prepare");
        remove_call_out("gamble_start");
        remove_call_out("gamble_perform");
        remove_call_out("gamble_finish");
        call_out ("gamble_prepare", 2);
        room_status = 1;
}

int do_bet(string arg)
{
        object me = this_player();
        string what;
        int amount;
        string money;
        object ob;
        object zj;

        if (! objectp(zj = present("zhuang jia", this_object())))
                return notify_fail("庄家都没有，你要和谁赌？\n");

        if (! living(zj))
                return notify_fail("你还是等庄家醒了再说吧！\n");

        if (! arg || sscanf (arg,"%s %d %s", what, amount, money) != 3)
                return notify_fail(CYN "赌客讥笑道：哪里有你那样赌钱的？\n" NOR);

        if (what != "tc" &&
            what != "sd" &&
            what != "qx" &&
            what != "sx")
                return notify_fail(CYN "庄家皱眉道：你要押哪一种骰？\n" NOR);

        ob = present(money + "_money", me);
        if (! ob)
                return notify_fail(CYN "庄家皱眉道：你身上没有这种钱吧？\n" NOR);

        if (amount < 1)
                return notify_fail(CYN "庄家皱眉道：那么少？不够，不够，再多押点。\n" NOR);

        if (amount > ob->query_amount())
                return notify_fail(CYN "庄家皱眉道：你有那么多钱吗？\n" NOR);

	if (amount > 10)
		return notify_fail(CYN "庄家喊道：怎么零零碎碎的那么多？换成整票再来下注！\n" NOR);

	if (ob->query("base_value") * amount > 100000)
		return notify_fail(CYN "庄家大声道：赌注最大十两黄金。\n" NOR);

        if (me->query_temp("gamble_bet/amount") > 0)
                return notify_fail(CYN "庄家道：你已经押过了，就等着开盅吧。\n" NOR);

        if (room_status > 1)
                return notify_fail(CYN "庄家赔笑道：现在正在赌呢，请你稍等片刻。\n" NOR);

        me->set_temp("gamble_bet/kind", what);
        me->set_temp("gamble_bet/amount", amount);
        me->set_temp("gamble_bet/money", money);
        message_vision(sprintf("$N拿出%s%s%s，押在%s上。\n",
                               chinese_number(amount),
                               ob->query("base_unit"),
                               ob->query("name"),
                               gutous[what]),
                               me);
        if (amount == ob->query_amount())
                destruct (ob);
        else
                ob->add_amount(-amount);

        if (! arrayp(query_temp("better")))
                set_temp("better", ({ me }));
        else
                add_temp("better", ({ me }));

        return 1;
}

int valid_leave(object me, string dir)
{
        if (dir == "south")
        {
                if (me->query_temp ("gamble_bet/amount") > 0) 
                message_vision (CYN "$N" CYN "扔下押骰的钱，不要了。\n" NOR, me);
                me->delete_temp("gamble_bet");
        }
        return ::valid_leave(me,dir);
}

void display_bet(object room, int i)
{
        string str;
        switch (i)
        {
        case 1:
                str = 
"┌───┐\n"+
"│　　　│\n"+
"│　●　│\n"+
"│　　　│\n"+
"└───┘\n";

                break;
        case 2:
                str = 
"┌───┐\n"+
"│　　　│\n"+
"│●　●│\n"+
"│　　　│\n"+
"└───┘\n";
                break;
        case 3:
                str =
"┌───┐\n"+
"│●　　│\n"+
"│　●　│\n"+
"│　　●│\n"+
"└───┘\n";
                break;
        case 4:
                str = 
"┌───┐\n"+
"│●　●│\n"+
"│　　　│\n"+
"│●　●│\n"+
"└───┘\n";
                break;
        case 5:
                str =
"┌───┐\n"+
"│●　●│\n"+
"│　●　│\n"+
"│●　●│\n"+
"└───┘\n";
                break;
        case 6:
                str = 
"┌───┐\n"+
"│●　●│\n"+
"│●　●│\n"+
"│●　●│\n"+
"└───┘\n";
                break;
        }
        tell_room(room,str);
}

int rdm()
{
        return random2(6) + 1;
}

void gamble_prepare()
{
        object room = this_object();
        tell_room (room, CYN "庄家唱道：新开盘！预叫头彩！\n" NOR);
        tell_room (room, CYN "庄家将两枚玉骰往银盘中一撒。\n" NOR);
        big[0] = rdm();
        big[1] = rdm();
// keep two numbers different for a probability == 1/36
        while (big[0] == big[1])
        {
                reset_eval_cost();
                big[1] = rdm();
        }
        display_bet(room,big[0]);
        display_bet(room,big[1]);
        tell_room(room, CYN "\n庄家叫道：头彩骰号是「" HIY + chinese_number(big[0]) +
                        NOR + CYN "」和「" HIY + chinese_number(big[1]) + NOR + CYN
                        "」。\n\n" NOR);
        tell_room(room, CYN "接着庄家麻利地顺手将玉骰从盘中收回：现在开盘押钱！\n" NOR);
        room_status = 1;
        call_out("gamble_start",24);
        delete_temp("better");
}
 
void gamble_start()
{
        object room = this_object();
        tell_room (room, CYN "庄家喊声：封盘停押！\n" NOR);
        tell_room (room, CYN "\n接着庄家又补叫道：本盘头彩骰号是「" HIY +
                         chinese_number(big[0]) + NOR + CYN "」和「" HIY +
                         chinese_number(big[1]) + NOR + CYN "」。\n\n" NOR);

        tell_room (room, CYN "然后庄家将两枚玉骰扔进两个金盅，一手持一盅摇将起来。\n" NOR);
        room_status = 2;
        call_out("gamble_perform", 6, 0);
        call_out("gamble_perform", 12, 1);
        call_out("gamble_finish", 18);
}
void gamble_perform (int i)
{
        object room = this_object();
        tell_room(room, HIY "\n金盅倒扣在银盘上，玉骰滚了出来。\n" NOR);
        res[i] = rdm();
        display_bet (room,res[i]);
}

void player_wins(object who, int total)
{
        object money = new("/clone/money/" +
                           who->query_temp("gamble_bet/money"));
        int amount = who->query_temp("gamble_bet/amount");
        total = total * amount;
        money->set_amount(total);
        message_vision(sprintf("$N赢了%s%s%s！\n",
                       chinese_number(total),
                       money->query("base_unit"),
                       money->query("name")),
                       who);
        money->move(who);
}

void player_loses(object who, int total)
{
        object money = new("/clone/money/" +
			   who->query_temp("gamble_bet/money"));
        total = who->query_temp("gamble_bet/amount");
        message_vision(sprintf("庄家将$N押在银盘中的%s%s%s收走。\n",
                               chinese_number(total),
                               money->query("base_unit"),
                               money->query("name")),
                               who);
        destruct(money);
}

void gamble_finish()
{
        string win;
        int total, i;
        object room = this_object();
        object *list;

        if (res[0]==big[0] && res[1]==big[1])
        {
                total = 36;
                win = "tc";
        } else
        if (res[0]==res[1] && (res[0]/2*2 == res[0]))
        {
                total = 12;
                win = "sd";
        } else 
        {
                int r = res[0]+res[1];
                if (r==7)
                {
                        total = 6;
                        win = "qx";
                } else if (r==3 || r==5 || r==9 || r==11) 
                {
                        total = 3;
                        win = "sx";
                } else
                {
                        total = 0;
                        win = "none of them";
                }
        }
        if (total == 0)
                tell_room(room, CYN "庄家叫道：" + chinese_number(res[0]) +
                                chinese_number(res[1]) + "……空盘！\n" NOR);
        else
                tell_room(room, CYN "庄家叫道：" + chinese_number(res[0]) +
                                chinese_number(res[1])+"……" + gutous [win] +
                                 "！\n" NOR);

        list = query_temp("better");
        i = sizeof(list);
        while (i--)
        {
                if (! objectp(list[i]))
                        continue;

                if (environment(list[i]) == room)
                {
                        if (list[i]->query_temp("gamble_bet/kind") == win)
                                player_wins(list[i],total); else
                        if (list[i]->query_temp("gamble_bet/kind"))
                                player_loses(list[i],total);
                }

                list[i]->delete_temp("gamble_bet");
        }
        tell_room (room,"\n");
        call_out ("gamble_prepare",5);
}

