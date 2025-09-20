#include <ansi.h>
#include <command.h>

inherit NPC;

void create()
{
    set_name("店小二", ({"xiao er", "xiao", "waiter"}));
    set("gender", "男性");
    set("age", 22);
    set("long", "这位店小二正笑咪咪地忙著，还不时拿起挂在脖子上的抹布擦脸。\n");
    set("combat_exp", 100);
    set("attitude", "friendly");
    set("rank_info/respect", "小二哥");
    set("startroom", "/d/city/kedian");
    setup();
    if (clonep())
        keep_heart_beat();
}

string accept_ask(object me, string topic)
{
    switch (random(5))
    {
    case 0:
        return "嗨！我忙着呢，你和我那醉仙楼做活的兄弟聊聊吧！";

    case 1:
        return "你干啥？没看我忙着呢么？";

    case 2:
        return "哎呀呀，你没看我忙着呢么，要打听消息你去找我醉仙楼做活的兄弟吧？";

    case 3:
        return "春来茶馆的老板娘阿庆嫂消息也灵通，那些爷们什么都告诉她，要不你问她去？";

    default:
        return "我那醉仙楼做活的兄弟消息才叫灵通，你去和他聊吧。";
    }
}

void init()
{
    object ob;

    ::init();

    if (interactive(ob = this_player()) && !is_fighting())
    {
        remove_call_out("greeting");
        call_out("greeting", 1, ob);
    }
    add_action("do_drop", "drop");
    add_action("do_exchange", "exchange");
    add_action("do_exchange", "duihuan");
}

void greeting(object ob)
{
    if (!ob || environment(ob) != environment())
        return;
    switch (random(2))
    {
    case 0:
        say(CYN "店小二笑咪咪地说道：这位" + RANK_D->query_respect(ob) + CYN + "，进来喝杯茶，歇歇腿吧。\n" NOR);
        break;
    case 1:
        say(CYN "店小二用脖子上的毛巾抹了抹手，说道：这位" + RANK_D->query_respect(ob) + CYN + "，请进请进。\n" NOR);
        break;
    }
}

int accept_object(object me, object ob)
{

    if (ob->query("money_id") && ob->value() >= 1000)
    {
        tell_object(me, CYN "小二一哈腰，说道：多谢您老，客官请上楼歇息。\n" NOR);
        me->set_temp("rent_paid", 1);
        return 1;
    }

    switch (random(6))
    {
    case 0:
        command("say 好！好！");
        break;
    case 1:
        command("say 不需要的东西全给我！");
        break;
    }

    if (!ob->is_character())
    {
        destruct(ob);
        return -1;
    }
    return 1;
}

void heart_beat()
{
    string start_room;
    object ob;

    if (stringp(start_room = query("startroom")) && find_object(start_room) == environment())
    {
        foreach (ob in all_inventory(environment()))
        {
            if (!ob->is_character() || interactive(ob) || playerp(ob) || ob->query_temp("owner"))
                continue;

            if (stringp(start_room = ob->query("startroom")) && find_object(start_room) == environment())
                continue;

            if ((string)ob->query("id") == "corpse")
                message_vision(HIC "\n$N" HIC "站起身，把$n" HIC "拎到"
                                   "门外，然后又若无其事地走了回来。\n\n" NOR,
                               this_object(), ob);
            else
                message_vision(CYN "\n$N" CYN "对$n" CYN "满脸歉然地说"
                                   "道：对不住，小店已经满座了。\n" HIC "$n" HIC "听后一愣，摇了摇头，骂骂咧咧地转身"
                                   "离去。\n" NOR,
                               this_object(), ob);
            ob->move("/d/city/beidajie1");
        }
    }
    ::heart_beat();
}

int do_drop(string arg)
{
    int i;
    object *obs;
    object ob;
    object me;

    if (!arg)
        return 0;

    me = this_player();
    if (objectp(ob = present(arg, me)) &&
        ob->is_character() && !playerp(ob))
    {
        me->add_temp("static/drop_npc", 1);
        if (me->query_temp("static/drop_npc") > 1 &&
            me->query("combat_exp") >= 50000)
        {
            message_vision(CYN "\n$N" CYN "大怒道：好你个" + RANK_D->query_rude(ob) + CYN "，还敢来添乱？\n" NOR + HIC "说罢$N" HIC "一声大"
                               "叫，北丑顿时冲了出来，飞起两脚，将$n" HIC "和" +
                               ob->name() + HIC "一起踢了出去。\n\n" NOR,
                           this_object(), me);

            ob->move("/d/city/beidajie1");
            me->move("/d/city/beidajie1");
            message("vision", HIC "只听客店处砰叮咣啷一阵轰响，便见" + me->name() + HIC "和" + ob->name() + HIC "一起飞了出来。\n" NOR, environment(me), me);

            me->receive_damage("qi", 1);
            ob->die();
            me->unconcious();
            return 1;
        }

        message_vision(CYN "\n$N" CYN "怒道：晦气，晦气！这里又不是棺材店，你搬个要死"
                           "的人进来干嘛？\n" NOR +
                           HIC "说罢$N" HIC "一招手，顿时来了一群"
                               "彪形大汉，将$n" HIC "和" +
                           ob->name() + HIC "一起赶了出去。\n\n" NOR,
                       this_object(), me);

        ob->move("/d/city/beidajie1");
        me->move("/d/city/beidajie1");
        message("vision", HIC "只听客店处传来一阵轰闹声，" + me->name() + HIC "被人赶"
                              "了出来，随后半死不活的" +
                              ob->name() + HIC "也被扔了出来。"
                                               "\n" NOR,
                environment(me), me);
        me->receive_damage("qi", 1);
        return 1;
    }

    if (!DROP_CMD->main(me, arg))
        return 0;

    if (!GET_CMD->main(this_object(), arg))
        return 1;

    obs = all_inventory(this_object());
    for (i = 0; i < sizeof(obs); i++)
        if (!obs[i]->is_character())
            destruct(obs[i]);
    if (!random(5))
    {
        switch (random(4))
        {
        case 0:
            command("say 你不要我要！");
            break;
        case 1:
            command("sigh " + this_player()->query("id"));
            command("say 糟蹋啊，作孽啊！");
            break;
        case 2:
            command("say 败家子，败家子！");
            break;
        default:
            command("heihei");
            break;
        }
    }
    return 1;
}

int do_exchange(string arg)
{
    object ob, me = this_player();
    int jifen, cost;

    jifen = me->query("state/jifen", 1);

    if (!jifen)
        return notify_fail(CYN "店小二微笑道：客官，您暂时没有积分呢，可以通过报告BUG或在扬州武庙祈祷获得积分。\n" NOR);

    if (!arg)
        return notify_fail(CYN "店小二微笑道：你要兑换"
                               "什么东西？(help jifen)\n" NOR);

    switch (arg)
    {
    case "血菩提":
        cost = 5;
        ob = new ("/clone/fam/pill/puti1");
        break;
    case "舍利子":
        cost = 5;
        ob = new ("/clone/fam/pill/sheli1");
        break;
    case "昊天果":
        cost = 5;
        ob = new ("/clone/fam/pill/linghui1");
        break;
    case "壮骨粉":
        cost = 5;
        ob = new ("/clone/fam/gift/con1");
        break;
    case "福寿膏":
        cost = 5;
        ob = new ("/clone/fam/gift/dex1");
        break;
    case "增慧丹":
        cost = 5;
        ob = new ("/clone/fam/gift/int1");
        break;
    case "神力丸":
        cost = 5;
        ob = new ("/clone/fam/gift/str1");
        break;
    case "冰菩提":
        cost = 10;
        ob = new ("/clone/fam/pill/puti3");
        break;
    case "昊天丹":
        cost = 10;
        ob = new ("/clone/fam/pill/linghui2");
        break;
    case "帝者舍利":
        cost = 10;
        ob = new ("/clone/fam/pill/sheli3");
        break;
    case "菩提子":
        cost = 15;
        ob = new ("/clone/fam/pill/puti4");
        break;
    case "圣舍利":
        cost = 15;
        ob = new ("/clone/fam/pill/sheli4");
        break;
    case "百年人参":
        cost = 15;
        ob = new ("/clone/fam/pill/renshen1");
        break;
    case "百年灵芝":
        cost = 15;
        ob = new ("/clone/fam/pill/lingzhi1");
        break;
    case "天山雪莲":
        cost = 15;
        ob = new ("/clone/fam/pill/xuelian1");
        break;
    case "百年参心丹":
        cost = 20;
        ob = new ("/clone/fam/pill/renshen3");
        break;
    case "天山雪莲膏":
        cost = 20;
        ob = new ("/clone/fam/pill/xuelian3");
        break;
    case "百年灵芝丸":
        cost = 20;
        ob = new ("/clone/fam/pill/lingzhi3");
        break;
    case "玄武铸骨丹":
        cost = 30;
        ob = new ("/clone/fam/gift/con2");
        break;
    case "朱雀玲珑丹":
        cost = 30;
        ob = new ("/clone/fam/gift/dex2");
        break;
    case "青龙炼睿丹":
        cost = 30;
        ob = new ("/clone/fam/gift/int2");
        break;
    case "白虎赐元丹":
        cost = 30;
        ob = new ("/clone/fam/gift/str2");
        break;
    case "千年参心丹":
        cost = 40;
        ob = new ("/clone/fam/pill/renshen4");
        break;
    case "千年雪莲丹":
        cost = 40;
        ob = new ("/clone/fam/pill/xuelian4");
        break;
    case "千年灵芝丸":
        cost = 40;
        ob = new ("/clone/fam/pill/lingzhi4");
        break;
    case "洗髓再造仙丹":
        cost = 50;
        ob = new ("/clone/fam/gift/con3");
        break;
    case "破阳无极仙丹":
        cost = 50;
        ob = new ("/clone/fam/gift/dex3");
        break;
    case "神恩通慧仙丹":
        cost = 50;
        ob = new ("/clone/fam/gift/int3");
        break;
    case "蚩尤诛元仙丹":
        cost = 50;
        ob = new ("/clone/fam/gift/str3");
        break;
    case "子午龙甲丹":
        cost = 80;
        ob = new ("/clone/fam/max/longjia");
        break;
    case "玄黄紫箐丹":
        cost = 80;
        ob = new ("/clone/fam/max/xuanhuang");
        break;
    case "镇狱惊天丸":
        cost = 100;
        ob = new ("/clone/fam/max/zhenyu");
        break;
    default:
        return notify_fail(CYN "店小二对你摇摇头道：你只能兑换"
                               "规定范围内的物品。\n" NOR);
    }

    if (jifen < cost)
        return notify_fail(CYN "店小二对你摇摇头道：您当前积分"
                               "只有 " + jifen + " 点，兑换此物品需要 " + cost + " 点积分。\n" NOR);

    if (!ob)
        return notify_fail(CYN "店小二一惊，叫道：咦？我的东西"
                               "…我的东西呢?！\n" NOR);
    me->add("state/jifen", -cost);

    ob->move(this_object());
    command("give " + ob->query("id") + " to " + me->query("id"));
    command("say 兑换完成，欢迎再次光临！");

    CHANNEL_D->do_channel(this_object(), "rumor", sprintf("听说%s在"
                "店小二处兑换了一%s%s" HIM "。" NOR, me->name(), ob->query("unit"), ob->name()));

    return 1;
}
