// ganjiang.c  干将
// Written by Doing Lu  1998/11/2

// 干将负责炼道具的场景，但是不接受玩家的物品，玩家如果炼制
// 道具应该和莫邪打交道。如果 player 在莫邪那里将一切手续办
// 妥，莫邪将原料交给干将。通过accept_object 函数启动干将的
// 炼制程序。

// 干将接收到莫邪传来的道具，则对他进行锻炼，锻炼完以后，设
// 设置道具的铸造者，铸造者的ID，不设置道具的有效点数 point，
// 因为在莫邪那里已经设置了。并且等候 player 输入关于道具的
// 信息，如果超时，就清除三人的标志，并解除object。如果用户
// finish，这询问 player 是否决定，如果是则生成道具文件，并
// 在生成道具送给 player，否则继续修改。

inherit NPC;
inherit F_NOCLONE;

#include <ansi.h>

// 如果字符串被设置成这个值，表示输入的字符串具有非法的格式
#define	ILLEGAL_STR	"."
// 在convert时看看要不要去掉彩色
#define	NOCOLOR		1
#define COLORABLE	0

private int	ask_me();				// 显示定做信息
private int	show_order();				// 显示规则信息
private int	start_work(object me, object ob);	// 开始工作
private int	prepare_make(object me, object ob);	// 开始打造
private void	clear_data();				// 清除 ganjiang, moye, player 的临时变量并去除粗坯对象
private string  create_file(object item_temp);
private int     save_item_file(string filename, string content);
private void    tell_rules(object me);
private void    waiting(object me, object ob, object moye);
private string	converts(string arg, int max_len, int nocolor);
private string  prop_segment(mapping p, string path);
private int     save_item_file(string filename, string content);
private int     legal_chinese(string str);

void create()
{
        seteuid(getuid());

	set_name("干将", ({ "gan jiang", "ganjiang", "gan" }));
	set("long", "他长得粗壮有力，脸庞似如刀削，透出一股英气。他是古往今来有名的铸剑大师。\n" );

	set("nickname", HIR "剑师" NOR);
	set("gender", "男性");
	set("attitude", "friendly");

	set("age", 1535);
	set("shen_type", 0);

	set("str", 1000);

	set("inquiry", ([
		"炼制" : (: ask_me :),
		"练剑" : (: ask_me :),
		"炼剑" : (: ask_me :),
		"铸剑" : (: ask_me :),
		"打造" : (: ask_me :),
		"铸造" : (: ask_me :),
		"制造" : (: ask_me :),
		"打制" : (: ask_me :),
		"定制" : (: ask_me :),
		"定做" : (: ask_me :),
		"定造" : (: ask_me :),
		"兵器" : (: ask_me :),
		"道具" : (: ask_me :),
		"装备" : (: ask_me :),
		"武器" : (: ask_me :),
		"刀剑" : (: ask_me :),
		"装甲" : (: ask_me :),

		"原料" : "炼剑就得有原料，一分钱，一分货，好原料就能出好东西。\n",
		"定金" : "定金少得很，才五两黄金，要交定金请交给莫邪。\n",
		"价格" : "一分钱一分货......",
                "销毁" : "那就...退回(discard)来吧...",
                "退货" : "那就...退回(discard)来吧...",

		"规则" : (: show_order :),
		"方法" : (: show_order :),
		"order": (: show_order :),
		
	]));

        setup();

        set("startroom", "/d/item/xiaowu");
        check_clone();
        if (! this_object()) return;

	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
	add_action("do_name", "name");
	add_action("do_name", "命名");
	add_action("do_desc", "desc");
	add_action("do_desc", "描述");
	add_action("do_wieldmsg", "wieldmsg");
	add_action("do_wieldmsg", "wearmsg");
	add_action("do_wieldmsg", "装备");
	add_action("do_wieldmsg", "装备信息");
	add_action("do_unwield", "unwieldmsg");
	add_action("do_unwield", "removemsg");
	add_action("do_unwield", "收起");
	add_action("do_unwield", "收起信息");
	add_action("do_finish", "finish");
	add_action("do_finish", "完成");

	add_action("do_help", "help");
	add_action("do_help", "帮助");

        add_action("do_discard", "discard");
}

// 发出提示信息
private int ask_me()
{
	message_vision("干将对$N说道：这些事请问莫邪，我只管炼剑。\n", this_player());
	return 1;
}

int accept_object(object me, object ob)
{
	if (me->name(1) == "莫邪")
	{
		if (me->query("id") != "mo ye")
		{
			command ("kick " + me->query("id"));
			message_vision("$N嘿嘿的奸笑了两声，对$n说道："
                                       "你以为取了我妻子的名字就能蒙蔽"
                                       "我？我还没瞎呢！\n",
                                       this_object(), me);
			return 1;
		}
		start_work(ob->query("item/owner"), ob);
                return 1;
	}

	if (ob->query("item_origin"))
	{
		message_vision("干将对$N说：你别给我这东西，把这个先交"
                               "给莫邪，在她那里付了钱再说。\n", me);
		return 0;
	} else
        if (ob->is_item_make())
        {
                if (ob->item_owner() != me->query("id"))
                {
                        command("heng");
                        command("say 这是你的东西吗？没收了！");
                        destruct(ob);
                        return 1;
                }
                message_vision("$N疑惑的望着$n道：“你是嫌它"
                               "不好么？那就退掉(discard)吧！”\n",
                               this_object(), me);
                return 0;
        }

        message_vision("干将冷冷的对$N说道：你给我这些东西干什"
                       "么？我炼剑，不用这些东西。\n", me);
	return 0;
}

private int start_work(object me, object ob)
{
	remove_call_out("prepare_make");
	call_out("prepare_make", 1, me, ob);
        set_temp("item/making", ob);
        set_temp("item/player", me);
        me->set_temp("item/status", "waiting");
	return 1;
}

private int prepare_make(object me, object ob)
{
	message_vision(HIC "\n$N说道：好，开炉锻炼！\n\n" NOR, this_object());
	message_vision(HIM "$N接过莫邪手中的" + ob->name() +
		       HIM "，随手把它抛入炉内，霎时间，那" + ob->name() +
		       HIM "已被火炉中的熊熊" HIR "烈焰" HIM "吞没。\n" +
		       "$N凝视着炉火，喃喃说道：天地之精华为其血脉，日"
                       "月之光辉是其灵气……\n\n" NOR , this_object());
	remove_call_out("work_step_1");
	call_out("work_step_1", 5, me, ob);
	return 1;
}

private int work_step_1(object me, object ob)
{
	message_vision(HIG "炉火渐渐的转成了绿色，火苗不断跳跃，你觉得屋"
                       "内十分燥热，可是干将莫邪若无其事。\n\n" NOR, this_object());
	if (objectp(me) && environment(me) == environment())
	{
		me->set_temp("item/can_help", 1);
		message_vision(HIW "$N对$n说道：如果你想炼得更好，需"
                               "要注入自己的精气血脉，如是你有此意，请"
                               "助(help)我一臂之力。\n\n", this_object(), me);
	}
	remove_call_out("work_step_2");
	call_out("work_step_2", 6, me, ob);
	return 1;
}

private int work_step_2(object me, object ob)
{
	message_vision(RED "炉火淡淡的暗了下来，呈现出一片红色……\n\n" NOR, this_object());
	remove_call_out("work_step_3");
	if (objectp(me))
                me->delete_temp("item/can_help");
	call_out("work_step_3", 3, me, ob);
	return 1;
}

private int work_step_3(object me, object ob)
{
	message_vision(HIW "$N左手持蛟龙剪，一扬手已经取出了" + ob->name() +
		       HIW "，右手持金刚锤聚精会神地用力锤打。\n渐渐的，" + ob->name() +
		       HIW "在干将手下的成了" + ob->query("item/ctype") +
		       HIW "的形状。\n\n" NOR, this_object());
	remove_call_out("work_step_4");
	call_out("work_step_4", 5, me, ob);
	return 1;
}

private int work_step_4(object me, object ob)
{
	message_vision(HIC "$N锤打完毕，大喝一声，将" + ob->query("item/ctype") +
		       HIC "抛入水池，只听丝丝作响，从水池腾起一股雾气，"
                       "弥漫四周。\n\n" NOR, this_object());
	remove_call_out("work_step_5");
	call_out("work_step_5", 3, me, ob);
	return 1;
}

private int work_step_5(object me, object ob)
{
	message_vision(HIW "$N缓缓的从水池抽出了炼好的" + ob->query("item/ctype") +
		       HIW "看了看，满意地说，很好，很好。\n\n" NOR,
                       this_object());
	remove_call_out("work_step_6");
	call_out("work_step_6", 2, me, ob);
}

private int work_step_6(object me, object ob)
{
	object moye;
//	int improve;

	if (! objectp(moye = present("mo ye")))
	{
		message_vision(HIW "干将看了看四周，说道：咦，莫邪呢？"
                               "算了算了，不做了，去吧！\n"
			       "干将把炼好的道具抛进火炉，就此不见。\n\n" NOR,
                               this_object());
		if (objectp(me))
                        me->delete_temp("item");

		if (objectp(ob) && present(ob, this_object()))
                        destruct(ob);

		delete_temp("item");
		return 1;
	}

        if (! objectp(me))
                me = find_player(ob->query("item/owner_id"));

	if (! objectp(me) || environment(me) != environment())
	{
		message_vision(HIW "$N叹了口气，说道：客人为何这就去"
                               "了！？罢了罢了，不做了，去吧！\n"
			       "$N把炼好的道具抛进火炉，就此不见。\n\n" NOR,
                               this_object());
		if (objectp(me))
                        me->delete_temp("item");

		if (objectp(ob) && present(ob, this_object()))
                        destruct(ob);

		delete_temp("item");
		moye->delete_temp("item");
		return 1;
	}
        moye->set_temp("item/status", "waiting");
	me->set_temp("item/status", "inputing");
	message_vision("$N对$n说道：一" + ob->query("item/unit") + "好" +
                       ob->query("item/ctype") + NOR "不能没有名字，你给它起个名字吧！\n",
                       this_object(), me);

        tell_rules(me);

	// 清除道具的名字，ID，和其它属性，并且设置道具的价值和制造者
	ob->set("item/long", "");
	ob->set("item/wield_msg", "");
	ob->set("item/wear_msg", "");
	ob->set("item/unwield_msg", "");
	ob->set("item/remove_msg", "");
	ob->set("item/owner_name", me->query("name"));
	ob->set("item/owner_id", me->query("id"));

	// 设置等待时间，最多3次
        set_temp("item/waited", 4);

	// 如果超时，提醒输入
	remove_call_out("waiting");
	call_out("waiting", 240, me, ob, moye);
	return 1;
}

// 以内力哺育炉火，提高道具等级
// 要求：精 >= 180  气 >= 300  内力有效等级 >= 100  内力 >= 800 最大内力 >= 1000
// 结果：耗费 200 点内力，可以提高 10%
int do_help(string arg)
{
	object me;
        object ob;

	me = this_player();
	if (me->query_temp("item/status") != "waiting")
	{
                return notify_fail("没你什么业务。\n");
	}
	if (! me->query_temp("item/can_help"))
	{
		if (arg) return 0;
		write("现在不是你帮忙的时候！\n", me);
		return 1;
	}
	if (me->query("jing") < 180)
	{
		message_vision(HIR "$N" HIR "长啸一声，双手搭上炉边，正待以内"
                               "力哺育炉火，突然眼前一黑……\n" NOR, me);
		tell_object(me, RED "你感到精力衰竭。\n" NOR);
		me->set("jing", 0);
		return 1;
	}
	me->receive_damage("jing", 180);
	if (me->query("qi") < 300)
	{
		message_vision(HIR "$N" HIR "长啸一声，双手搭上炉边，正待以内"
                               "力哺育炉火，突然眼前一黑……\n" NOR, me);
		tell_object(me, RED "你感到心虚气短。\n" NOR);
		me->set("qi", 0);
		return 1;
	}
	me->receive_damage("qi", 300);
	if (me->query("neili") < 800 || me->query("max_neili") < 1000)
	{
		message_vision(HIR "$N" HIR "长啸一声，双手搭上炉边，正待以内"
                               "力哺育炉火，突然眼前一黑……\n" NOR, me);
		tell_object(me, RED "你感到内力枯竭。\n" NOR);
		me->set("neili", 0);
		return 1;
	}
	message_vision(HIR "$N" HIR "长啸一声，双手搭上炉边。刹那间炉火沸腾，"
                       "一道" HIW "白光" HIR "直冲霄汉。\n\n" NOR, me);

        ob = query_temp("item/making");
        ob->add("item/point", ob->query("item/point") * me->query_skill("force") / 500);
	me->delete_temp("item/can_help");
	me->add("max_neili", -200);
	me->add("neili", -200);
	return 1;
}

private int show_order()
{
	object me;

	me = this_player();
	if (me->query_temp("item/status") != "inputing")
	{
		message_vision("$N冷冷的坐在那里，理都不理$n。\n",
                               this_object(), me);
		return 1;
	}

        tell_rules(me);
	return 1;
}

void tell_rules(object me)
{
	tell_object(me, CYN @RULES
干将在你耳边悄声说道：
名字需要你来定，其它信息系统有缺省的描述，当然也可以由你自己为它自定描述。
当然了，最好不用让别人误会的词语字句噢。具体的方法如下。
    命名: name 中文名字 英文代号。   (必须有)
    描述: desc 武器的描述文字。      (可  选)
    装备: wieldmsg   装备时的描述。  (可  选)
    收起: unwieldmsg 收起时的描述。  (可  选)
描述时分行请用\n，除了英文代号以外所有的文字都可以用颜色，使用颜色的方法可以参照nick 。
如果你觉得可以了，就请告诉我(finish)，要是没看清楚，可以再问问我 < 规则 >

RULES NOR);
}

void waiting(object me, object ob, object moye)
{
        if (! objectp(me))
                me = find_player(ob->query("item/owner_id"));

	if (! objectp(me))
	{
		message_vision("$N叹了口气说道：怎么这走了，算了算"
                               "了，去吧！\n", this_object());
		if (objectp(moye))
                        moye->delete_temp("item");

		delete_temp("item");
		destruct(ob);
		return;
	}

	if (add_temp("item/waited", -1) <= 0)
	{
		// 等待超时
		if (objectp(moye))
                        moye->delete_temp("item");

		log_file("static/item", sprintf("%s %s do timeout when make item of %s\n",
				 log_time(), log_id(me),
				 (ob ? filter_color(ob->name(1)) : "???")));
		if (objectp(ob) && present(ob, this_object()))
                        destruct(ob);

		me->delete_temp("item");
		delete_temp("item");
                if (in_input(me)) return;
                if (environment(me) == environment())
		{
			message_vision("$N皱了皱眉头说道：这人怎么这么"
                                       "磨蹭，算了，不要就不要吧！\n",
                                       this_object());
			return;
		}
		message_vision("$N皱了皱眉头对$n说道：你这人怎么这么"
                               "磨蹭，不要就算了，恕不退款！\n",
                               this_object(), me);
		return;
	}

	if (environment(me) != environment())
	{
		message_vision("$N疑惑地说道：人怎么跑掉了？算了，再等"
                               "他一会吧。\n", this_object());
	} else
        if (! in_input(me))
	{
		message_vision(HIR "$N" HIR "催$n" HIR
                               "道：快点，快点，别磨蹭，否则我可就不做了。\n" NOR,
                               this_object(), me);
	}

        remove_call_out("waiting");
	call_out("waiting", 300, me, ob, moye);
}

private void clear_data()
{
        object me;
	object ob;
	object moye;

	if (objectp(moye = present("mo ye")))
		moye->delete_temp("item");

	if (objectp(ob = query_temp("item/making")))
		destruct(ob);

        if (objectp(me = query_temp("item/player")))
                me->delete_temp("item");

	delete_temp("item");
	remove_call_out("waiting");
}

int do_name(string arg)
{
	object me;
        object ob;
//      string pname;
	string sname, sid;

	me = this_player();
	if (me->query_temp("item/status") != "inputing")
                return 0;

	if (! arg || sscanf(arg, "%s %s", sname, sid) != 2)
	{
		write("格式不对！应该是：命名 中文名字 英文名字\n例如：命名 长剑 sword\n");
		return 1;
	}

	// ILLEGAL_STR = "." 表示非法的输入
	if ((sname = converts(sname, 14, COLORABLE)) == ILLEGAL_STR)
                return 1;

	if ((sid = converts(sid, 8, NOCOLOR)) == ILLEGAL_STR)
                return 1;

        if (! sname || ! sid)
        {
                message_vision("$N摇摇头，对$n道：不行不行，你好好个定个名字！\n",
                               this_object(), me);
                return 1;
        }

        if (file_size(ITEM_DIR + me->query("id")[0..0] + "/" +
                      me->query("id") + "-" + sid + ".c") != -1)
        {
                message_vision("$N摇摇头，对$n道：不好，你不要再用(" + sid +
                               ")这个英文代号了，换一个吧！\n",
                               this_object(), me);
                return 1;
        }

        if (! is_chinese(filter_color(sname)))
        {
                command("kick " + me->query("id"));
                command("say 不会写中文字怎么的？");
                return 1;
        }

        if (! is_legal_id(sid))
	{
                command("say 英文代号必须全部用小写英文才可以！");
                return 1;
	}

        if (strlen(filter_color(sname)) < 4)
        {
                command("say 我说你这名字起得也太短了吧，至少两个汉字！");
                return 1;
        }

        if (strlen(sid) < 3)
        {
                command("say 我说你这代号起得也太短了吧，至少三个字符！");
                return 1;
        }

        if (sname[0] == 27 &&
            sname[4] == 'm')
        {
                // Add color prefix
                sname = NOR + sname;
        }

	ob = query_temp("item/making");
	ob->set("item/name", sname);
	ob->set("item/id", sid);

	write("名字：" CYN + sname + "    代号：" CYN + sid + NOR "\n");
	return 1;
}

int do_desc(string arg)
{
	object ob;
	object me;
        string chk;

	me = this_player();
	if (me->query_temp("item/status") != "inputing")
                return 0;

	ob = query_temp("item/making");
        if (! ob->query("item/name"))
        {
                message_vision("$N瞪了$n一眼道：你还是先给它取好名字再考虑描述吧！\n",
                               this_object(), me);
                return 1;
        }

	if (! arg)
	{
		write("参照格式：应该是 desc 描述的文字。\n例如：一把"
                      "锋利的$n\\n它在阳光下闪闪发光 -- 其中\\n表示换行，$n代表道具。\n");
		return 1;
	}

	if ((arg = converts(arg, 200, COLORABLE)) == ILLEGAL_STR)
                return 1;

        arg = replace_string(arg, "$N", me->name(1));

        chk = filter_color(arg);
        if (strlen(chk) >= 2 && chk[0..1] == "你" || strsrch(chk, "\\n你") != -1)
                return notify_fail("对不起，描述不能以“你”字打头。\n");

        chk = replace_string(chk, " ", "");
        chk = replace_string(chk, "\\n", "");
        chk = replace_string(chk, "$n", "");
        if (! legal_chinese(chk))
                return notify_fail("对不起，描述必须使用汉字和系统规定可以使用的代表符号。\n");

	arg = replace_string(arg, "$n", ob->query("item/name"));
	arg = replace_string(arg, "\\n", "\n");
	arg = chinese_desc(arg);
	ob->set("item/long", arg);
	write(CYN "当你观察它的时候将会出现下列描述：\n" NOR + arg + "\n");
	return 1;
}

int do_wieldmsg(string arg)
{
	object ob;
	object me;
        string chk;

	me = this_player();
	if (me->query_temp("item/status") != "inputing")
                return 0;

	ob = query_temp("item/making");
        if (! ob->query("item/name"))
        {
                message_vision("$N瞪了$n一眼道：你还是先给它取好名字再考虑描述吧！\n",
                               this_object(), me);
                return 1;
        }

	if (! arg)
	{
		write("参照格式：应该是 wieldmsg 描述的文字。\n例如："
                      "$N伸手一抖，抽出一把锋利长剑。 -- 其中$N表示你自"
                       "己，$n代表道具。\n");
		return 1;
	}

	if ((arg = converts(arg, 200, COLORABLE)) == ILLEGAL_STR)
                return 1;

        chk = filter_color(arg);
        if (strlen(chk) >= 2 && chk[0..1] == "你" || strsrch(chk, "\\n你") != -1)
                return notify_fail("对不起，描述不能以“你”字打头。\n");

        chk = replace_string(chk, " ", "");
        chk = replace_string(chk, "\\n", "");
        chk = replace_string(chk, "$N", "");
        chk = replace_string(chk, "$n", "");
        if (! legal_chinese(chk))
                return notify_fail("对不起，描述必须使用汉字和系统规定可以使用的代表符号。\n");

	// 这里不区分武器还是装备，在生成文件时自动选择一条信息
	arg = chinese_desc(arg);
	arg = replace_string(arg, me->name(1), "$N");
        ob->set("item/wear_msg", arg);
        ob->set("item/wield_msg", arg);
	arg = replace_string(arg, "\\n", "\n");
	arg = replace_string(arg, "$N", me->name(1));
	arg = replace_string(arg, "$n", ob->query("item/name"));
	write(CYN "当你装备它的时候将会出现下列描述：\n" NOR + arg + "\n");
	return 1;
}

int do_unwield(string arg)
{
	object ob;
	object me;
        string chk;

	me = this_player();
	if (me->query_temp("item/status") != "inputing")
                return 0;

	ob = query_temp("item/making");
        if (! ob->query("item/name"))
        {
                message_vision("$N瞪了$n一眼道：你还是先给它取好名字再考虑描述吧！\n",
                               this_object(), me);
                return 1;
        }

	if (! arg)
	{
		write("格式不对！应该是：unwield 描述的文字。\n例如："
                       "$N随手一挥，$n已入鞘内。 -- 其中$N表示你自己，$n代表道具。\n");
		return 1;
	}

	if ((arg = converts(arg, 200, COLORABLE)) == ILLEGAL_STR)
                return 1;

        chk = filter_color(arg);
        if (strlen(chk) >= 2 && chk[0..1] == "你" || strsrch(chk, "\\n你") != -1)
                return notify_fail("对不起，描述不能以“你”字打头。\n");

        chk = replace_string(chk, " ", "");
        chk = replace_string(chk, "\\n", "");
        chk = replace_string(chk, "$N", "");
        chk = replace_string(chk, "$n", "");
        if (! legal_chinese(chk))
                return notify_fail("对不起，描述必须使用汉字和系统规定可以使用的代表符号。\n");

	// 这里不区分武器还是装备，在生成文件时自动选择一条信息
	arg = chinese_desc(arg);
	arg = replace_string(arg, me->name(1), "$N");
        ob->set("item/unwield_msg", arg);
        ob->set("item/remove_msg", arg);
	arg = replace_string(arg, "\\n", "\n");
	arg = replace_string(arg, "$N", me->query("name"));
	arg = replace_string(arg, "$n", ob->query("item/name"));
	write(CYN "当你收回它的时候将会出现下列描述：\n" NOR + arg + "\n");
	return 1;
}

// 判断是否是合法的汉字
private int legal_chinese(string str)
{
	int i;

	if (strlen(str) < 2) return 0;

	for (i = 0; i < strlen(str); i++)
	{
		if (str[i] < 161 || str[i] == 255) return 0;
		if ((! (i % 2)) && str[i] >= 248) return 0;
	}

	return 1;
}

// 转换字符串中的颜色标志
private string converts(string arg, int max_len, int no_color)
{
    int i;

	// 去除字符串中的空格，引号，避免被别人利用做破坏
	arg = replace_string(arg, " ", ""); 
	arg = replace_string(arg, "\"", "'");

        for (i = 0; i < strlen(arg) - 1; i++)
        {
                if (arg[i] == '\\' && arg[i + 1] != 'n')
                {
                        write("字符'\\'后面只能跟随n字符表示回车！\n");
        		return ILLEGAL_STR;
                }
        }

        arg = replace_string(arg, ",", "，");
        arg = replace_string(arg, ":", "：");
        arg = replace_string(arg, "?", "？");

	if (no_color)
	{
		arg = replace_string(arg, "$BLK$", "");
		arg = replace_string(arg, "$RED$", "");
		arg = replace_string(arg, "$GRN$", "");
		arg = replace_string(arg, "$YEL$", "");
		arg = replace_string(arg, "$BLU$", "");
		arg = replace_string(arg, "$MAG$", "");
		arg = replace_string(arg, "$CYN$", "");
		arg = replace_string(arg, "$WHT$", "");
		arg = replace_string(arg, "$HIR$", "");
		arg = replace_string(arg, "$HIG$", "");
		arg = replace_string(arg, "$HIY$", "");
		arg = replace_string(arg, "$HIB$", "");
		arg = replace_string(arg, "$HIM$", "");
		arg = replace_string(arg, "$HIC$", "");
		arg = replace_string(arg, "$HIW$", "");
		arg = replace_string(arg, "$NOR$", "");
	} else
	{
		arg = replace_string(arg, "$BLK$", BLK);
		arg = replace_string(arg, "$RED$", RED);
		arg = replace_string(arg, "$GRN$", GRN);
		arg = replace_string(arg, "$YEL$", YEL);
		arg = replace_string(arg, "$BLU$", BLU);
		arg = replace_string(arg, "$MAG$", MAG);
		arg = replace_string(arg, "$CYN$", CYN);
		arg = replace_string(arg, "$WHT$", WHT);
		arg = replace_string(arg, "$HIR$", HIR);
		arg = replace_string(arg, "$HIG$", HIG);
		arg = replace_string(arg, "$HIY$", HIY);
		arg = replace_string(arg, "$HIB$", HIB);
		arg = replace_string(arg, "$HIM$", HIM);
		arg = replace_string(arg, "$HIC$", HIC);
		arg = replace_string(arg, "$HIW$", HIW);
		arg = replace_string(arg, "$NOR$", NOR);
                if (strlen(arg) < strlen(NOR) ||
                    arg[strlen(arg) - strlen(NOR)..<1] != NOR)
                {
                        // append NOR at tail
		        arg += NOR;
                }
	}
	if (strlen(arg) > max_len + 30 ||
            strlen(filter_color(arg)) > max_len)
	{
		write("对不起，这个字符串太长了，请不要输入超过" + chinese_number(max_len) +
		      "个字符长的字符串。\n");
		// 表示非法的输入
		return ILLEGAL_STR;
	}
	return arg;
}

int do_finish()
{
	object me;
	object ob;
	object moye;
	string msg;

	me = this_player();
	if (me->query_temp("item/status") != "inputing")
                return 0;

	if (! objectp(ob = query_temp("item/making")))
	{
		// 数据不对，可能是由于BUG造成，也可能是因为干将被update过
		write("系统故障：数据不一致，你无法完成炼制道具！\n");
		me->delete_temp("item");
		delete_temp("item");
		if (objectp(moye = present("mo ye")))
			moye->delete_temp("item");

		// 返回失败，停止进行
		return 0;
	}
	
	if (! ob->query("item/name"))
	{
		message_vision("$N瞪了$n一眼，说道：你怎么能不给它起个"
                               "名字？你要是不想要了就算了！\n",
                               this_object(), me);
		return 1;
	}

	if (! ob->query("item/id"))
	{
		message_vision("$N瞪了$n一眼，说道：你怎么能不给它起个"
                               "代号？你要是不想要了就算了！\n",
                               this_object(), me);
		return 1;
	}

	// 显示 player 输入的信息
	msg = sprintf("干将对$N说：你的道具描述如下，请看看有没有错。\n");
	message_vision(msg, me);
	// 私有信息
	msg = sprintf("道具名字：%s   道具英文代号：%s\n\n",
		      ob->query("item/name"), ob->query("item/id"));
	if (ob->query("item/long") != "")
		msg += sprintf(CYN "外观描述如下：" NOR "\n%s\n\n", ob->query("item/long"));
	else
		msg += "采用缺省的外观描述。\n";

	if (ob->query("item/wield_msg") != "")
		msg += sprintf(CYN "装备时描述如下：" NOR "\n%s\n\n",
			       replace_string(ob->query("item/wield_msg"), "\\n", "\n"));
	else
		msg += "装备时采用缺省的描述。\n";

	if (ob->query("item/unwield_msg") != "")
		msg += sprintf(CYN "收回时描述如下：" NOR "\n%s\n\n",
			       replace_string(ob->query("item/unwield_msg"), "\\n", "\n"));
	else
		msg += "收回时采用缺省的描述。\n";
		msg += CYN "如果没有问题，就可以继续进行了(y/n):" NOR;
	msg = replace_string(msg, "$N", me->query("name"));
	msg = replace_string(msg, "$n", ob->query("item/name"));

	tell_object(me, msg);

	// 判定 player 是否决定生成道具
	input_to("confirm_make", ob);
	return 1;
}

void confirm_make(string arg, object ob)
{
	object me;
	object moye;
	string item_filename;

	me = this_player();

        if (! objectp(query_temp("item/making")))
        {
                command("kick " + me->query("id"));
                command("say 你太磨蹭了，这生意我不做了，恕不退货！");
                return;
        }

	if (arg != "y" && arg != "Y")
        {
                message_vision(CYN "\n$N" CYN "点了点头道：那你还是再看看吧。\n" NOR, this_object());
                return;
        }

	message_vision("$N对$n说道：好，马上就好！\n",
                       this_object(), me);
	if (item_filename = create_file(ob))
	{
                // clear the old item's data
                DBASE_D->set_object_data(ob, 0);
		destruct(ob);
                catch(call_other(item_filename, "???"));
		ob = find_object(item_filename);
                if (! ob)
                {
                        message_vision("$N一呆，对$n道：抱歉抱歉！出了一些问题！\n",
                                       this_object(), me);
                } else
                {
		        ob->move(me, 1);
                        ob->save();             // Create the record in dbase
		        message_vision("$N把" + ob->query("name") + "交给了$n。\n",
                                       this_object(), me);
                        log_file("static/item", sprintf("%s %s created  %s(%s)\n",
				 log_time(), log_id(me),
                                 filter_color(ob->name(1)), ob->query("id")));
                }
	}

	if (objectp(moye = present("mo ye", environment())))
		moye->delete_temp("item");

	me->delete_temp("item");
	delete_temp("item");
	remove_call_out("waiting");
}

// 生成道具文档, 需要一个的道具原料对象
// 生成以后建立 ITEM_DIR/???.c 然后删除旧的原料对象, 生成一件新的道具，返回文件名

// 关于原料对象各个属性的说明(item/)
// ------ 用户可以描述的属性
// name			道具的名称， 必须要
// id			道具的ID，   必须要
// long			道具的描述，系统会在生成道具时自动添加关于炼制原料的描述
// wield_msg		装备武器的描述，如果没有系统会自动生成
// unwield_msg		收回武器时的描述
// wear_msg		穿上护甲时的描述
// unwear_msg		脱掉护甲时的描述

// ------ 不是用户描述的属性
// owner_id		制造者的ID
// owner_name           制造者的名字
// unit			单位
// type		        道具的类型 weapon 或 armor
// stype		道具的子类别 weapon 为 sword, blade, whip, stick ； armor 为 armor
// ctype		道具的类别的中文名 weapon 为 剑、刀、鞭、杖 ； armor 为 护甲
// value		道具的价值
// point                伤害力

// ------ 说明是用户自练的道具的属性
// item_make		1

private string create_file(object item_temp)
{
	string	buf;			// 生成文件的缓冲区
	string	filename;
        string  desc;
        mapping info;
        string  ih;
        string  id;

	// 生成文件名
        id = item_temp->query("item/owner_id");
	filename = ITEM_DIR + id[0..0] + "/" + id + 
		   "-" + item_temp->query("item/id") + ".c";
	if (file_size(filename) != -1)
	{
		write("无法生成档案，请通知巫师处理。\n");
		return 0;
	}
        assure_file(filename);
	buf = "// ITEM Made by player(" + item_temp->query("item/owner_name") +
              ":" + item_temp->query("item/owner_id") + ") " + filename + 
	      "\n// Written by GAN JIANG(Doing Lu 1998/11/2)\t" + ctime(time()) + "\n";
        info = item_temp->query("item");
        ih = up_case(info["stype"]);
	if (info["type"] == "weapon")
	{
		// 生成武器道具文件
		desc = "这是由" + item_temp->query("material_name") + "炼制而成的一" +
		       info["unit"] + info["ctype"] + "。\n";

                desc += info["long"];
                if (desc[strlen(desc) - 1] != '\n')
                        desc += "\n";

		desc += info["ctype"] + "柄上刻着一行小字：" +
		        info["owner_name"] + "(" + info["owner_id"] + ")\n";

		// 自动补充空信息
		if (info["wield_msg"] == "")
		{
			info["wield_msg"] = HIC "$N" HIC "一声清啸，抖出一" +
					    info["unit"] + HIC "$n" HIC "。" NOR;
		}

		if (info["unwield_msg"] == "")
		{
			info["unwield_msg"] = "$N随手一抹，收起了$n。";
		}
		buf += "#include <ansi.h>\n";
		buf += "#include <weapon.h>\n\n";
		buf += "inherit " + ih + ";\n";
                buf += "inherit F_ITEMMAKE;\n\n";
                buf += "void create()\n{\n";
		buf += sprintf("\tset_name(\"%s\", ({ \"%s\" }));\n", 
				info["name"], info["id"]);
		buf += sprintf("\tset_weight(%d);\n", item_temp->query_weight() * item_temp->query("item/wscale") / 100);
		buf += sprintf("\tset(\"item_make\", 1);\n");
		buf += sprintf("\tset(\"unit\", \"%s\");\n", info["unit"]);
		buf += sprintf("\tset(\"long\", \"%s\");\n", desc);
		buf += sprintf("\tset(\"value\", %d);\n", info["value"]);
		buf += sprintf("\tset(\"point\", %d);\n", info["point"]);
		buf += sprintf("\tset(\"material\", \"%s\");\n", item_temp->query("material_attrib"));
		buf += sprintf("\tset(\"wield_msg\", \"%s\\n\");\n", info["wield_msg"]);
		buf += sprintf("\tset(\"unwield_msg\", \"%s\\n\");\n", info["unwield_msg"]);
		buf += sprintf("\tif (! check_clone()) return;\n\trestore();\n");
		buf += sprintf("\tinit_%s(apply_damage());\n", info["stype"]);
                buf += prop_segment(info["prop"], "");
		buf += sprintf("\n\tsetup();\n}\n\n");
		// 生成武器道具文件完毕
	} else
	{
		// 生成防护道具文件
		desc = "这是由" + item_temp->query("material_name") + "炼制而成的一" +
		       info["unit"] + info["ctype"] + "。\n";

                desc += info["long"];
                if (desc[strlen(desc) - 1] != '\n')
                        desc += "\n";

		desc += info["ctype"] + "缘上刻着一行小字：" +
		        info["owner_name"] + "(" + info["owner_id"] + ")\n";

		// 自动补充空信息
		if (info["wear_msg"] == "")
		{
			info["wear_msg"] = YEL "$N" YEL "装备" +
					   info["name"] + YEL "。" NOR;
		}
		if (info["remove_msg"] == "")
		{
			info["remove_msg"] = YEL "$N" YEL "脱下了" +
					     info["name"] + YEL "。" NOR;
		}
		buf += "#include <ansi.h>\n";
		buf += "#include <armor.h>\n\n";
		buf += "inherit " + ih + ";\n";
                buf += "inherit F_ITEMMAKE;\n\n";
                buf += "void create()\n{\n";
		buf += sprintf("\tset_name(\"%s\", ({ \"%s\" }));\n", 
				info["name"], info["id"]);
		buf += sprintf("\tset_weight(%d);\n", item_temp->query_weight() * item_temp->query("item/wscale") / 100);
		buf += sprintf("\tset(\"item_make\", 1);\n");
		buf += sprintf("\tset(\"unit\", \"%s\");\n", info["unit"]);
		buf += sprintf("\tset(\"long\", \"%s\");\n", desc);
		buf += sprintf("\tset(\"value\", %d);\n", info["value"]);
		buf += sprintf("\tset(\"point\", %d);\n", info["point"]);
		buf += sprintf("\tset(\"material\", \"%s\");\n", item_temp->query("material_attrib"));
		buf += sprintf("\tset(\"wear_msg\", \"%s\\n\");\n", info["wear_msg"]);
		buf += sprintf("\tset(\"remove_msg\", \"%s\\n\");\n", info["remove_msg"]);
		buf += sprintf("\tif (! check_clone()) return;\n\trestore();\n");
                if (! info["prop"])
		        buf += sprintf("\tset(\"armor_prop/armor\", apply_armor());\n");
                else
                        buf += prop_segment(info["prop"], "");
		buf += sprintf("\n\tsetup();\n}\n\n");
		// 生成防护道具文件完毕
	}
        buf += sprintf("string long() { return query(\"long\") + item_long(); }\n");

	if (save_item_file(filename, buf) == 1)
		return filename;

	return 0;
}

// add mapping
private string prop_segment(mapping p, string path)
{
        string buf;
        string *ks;
        int i;

        buf = "";
        if (! p) return buf;

        ks = keys(p);
        for (i = 0; i < sizeof(ks); i++)
        {
                // check the paramter's type
                if (mapp(p[ks[i]]))
                {
                        path += ks[i] + "/";
                        buf += prop_segment(p[ks[i]], path);
                } else
                        buf += sprintf("\tset(\"%s\", %s);\n",
                                       path + ks[i], (string)p[ks[i]]);
        }

        return buf;
}

// filename 是写入文档的名称，已经包含有路径
// content 是写入文档的内容
private int save_item_file(string filename, string content)
{
	rm(filename);
	if (write_file(filename, content))
	{
                VERSION_D->append_sn(filename);
		return 1;
	} else
	{
		write("写入档案(" + filename + ")时出错，请通知巫师处理。\n");
		return 0;
	}
}

int do_discard(string arg)
{
        object money;
        object ob;
        object me;
        int n;

        if (! arg)
                return notify_fail("你去退回什么东西？\n");

        me = this_player();
        if (! objectp(ob = present(arg, me)))
                return notify_fail("你身上没有这种东西。\n");

        message_vision("$n拿出一" + ob->query("unit") + ob->name() +
                       "对$N说：“这个东西我想退掉了...”\n",
                       this_object(), me);
        if (ob->is_depot_ob())
		{
			command("say 我妻子精心炼制的东西你竟然还看不上眼？！");
		}
        else 
		{
			if (! ob->is_item_make())
			{
					command("heng");
					command("say 这不是我这里出来的东西，我可不能负责。");
					return 1;
			}

			if (ob->item_owner() != me->query("id"))
			{
					command("kick " + me->query("id"));
					command("say 你拿了别人的东西还敢来我这里？以为我是傻子？");
					return 1;
			}
		}
        command("sigh");
        command("say 一千多年来还没有什么人嫌我的货色不好的，算了！算了！");
        message_vision("$N接过$n递过来的" + ob->name() + "，随手"
                       "扔进了火炉，呆呆的望了半晌。\n",
                       this_object(), me);
        command("say 你既然不满意我的东西，我也不能收你的钱，"
                "这些算是我退回给你的！");
        n = (ob->query("value") * 8 / 10 + 9999) / 10000;
        if (! n)
        {
                money = new("/clone/money/silver");
                money->set_amount(1);
        } else
        {
                money = new("/clone/money/gold");
                money->set_amount(n);
        }
        message_vision("$N拿出一些" + money->name() + "交给"
                       "$n。\n", this_object(), me);
        log_file("static/item", sprintf("%s %s discard  %s(%s)\n",
				log_time(), log_id(me),
                                filter_color(ob->name(1)), ob->query("id")));
        me->delete("can_summon/" + ob->query("id"));
        rm(base_name(ob) + ".c");
	DBASE_D->clear_object(ob);
        money->move(me, 1);
        return 1;
}