//Room: duchang.c

#include <ansi.h>

inherit ROOM;

int room_status = 0;
int *big = allocate(2);
int *res = allocate(2);

int random2 (int i)
{
        return (random(i)+uptime()) % i;
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
                "south" : __DIR__"qixiang3",
        ]));
        set("item_desc", ([
                "sign": @TEXT
赌骰子方法:
bet <kind> <amount> <money> 

只收现银，概不赊欠。

kind:
    头彩 <tc>（骰数由每次开盘前确定）      ：一赢三十六
    双对 <sd>（两骰号相同，且为偶数）      ：一赢十二
    七星 <qx>（两骰之和为七）              ：一赢六
    散星 <sx>（两骰之和为三，五，九，十一）：一赢三
TEXT
        ]));

        set("objects", ([
                __DIR__"npc/zhuangjia" : 1,
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
                return notify_fail("请使用： bet <押骰种类> <数目> <货币>\n");

        if (what != "tc" &&
            what != "sd" &&
            what != "qx" &&
            what != "sx")
                return notify_fail("你要押哪一种骰？\n");

        ob = present(money + "_money", me);
        if (! ob)
                return notify_fail("你身上没有这种钱。\n");

        if (amount < 1)
                return notify_fail("请多押一些钱。\n");

        if (amount > ob->query_amount())
                return notify_fail("你身上的钱不够押。\n");

	if (amount > 10)
		return notify_fail("庄家喊道：怎么零零碎碎的那么多？"
				   "换成整票再来下注！\n");

	if (ob->query("base_value") * amount > 100000)
		return notify_fail("赌注最大十两黄金。\n");

        if (me->query_temp("gamble_bet/amount") > 0)
                return notify_fail("你已经押过了。\n");

        if (room_status > 1)
                return notify_fail("现在正在赌呢，稍等片刻。\n");

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
                message_vision ("$N扔下押骰的钱，不要了。\n",me);
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
        tell_room (room,"庄家唱道：新开盘！预叫头彩！\n");
        tell_room (room,"庄家将两枚玉骰往银盘中一撒。\n");
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
        tell_room(room,"庄家叫道：头彩骰号"+chinese_number(big[0])+
        chinese_number(big[1])+"！\n");
        tell_room(room, "接着庄家麻利地顺手将玉骰从盘中收回：现在开盘押钱！\n");
        room_status = 1;
        call_out("gamble_start",24);
        delete_temp("better");
}
 
void gamble_start()
{
        object room = this_object();
        tell_room (room,"庄家喊声：封盘停押！\n");
        tell_room (room,"又补道：本盘头彩骰号是"+chinese_number(big[0])+
        chinese_number(big[1])+"。\n");
        tell_room (room,"然后将两枚玉骰扔进两个金盅，一手持一盅摇将起来。\n");
        room_status = 2;
        call_out("gamble_perform", 6, 0);
        call_out("gamble_perform", 12, 1);
        call_out("gamble_finish", 18);
}
void gamble_perform (int i)
{
        object room = this_object();
        tell_room(room, " 金盅倒扣在银盘上，玉骰滚了出来。\n");
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
                tell_room(room, "庄家叫道：" + chinese_number(res[0])+
                                chinese_number(res[1])+"……空盘！\n");
        else
                tell_room(room, "庄家叫道："+chinese_number(res[0])+
                                chinese_number(res[1])+"……" +
                                               gutous [win]+"！\n");
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

