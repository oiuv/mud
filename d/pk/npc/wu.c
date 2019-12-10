#include <ansi.h>
#include "/kungfu/class/lingjiu/etc.h"

#define XIANGLUDAO  "/clone/lonely/xiangludao"

inherit NPC;
inherit F_MASTER;
inherit F_QUESTER;

mixed ask_me();
mixed ask_dao();
mixed ask_skill();

void create()
{
    object ob;
    set_name("乌老大", ({ "wu laoda", "wu", "laodao" }));
    set("gender", "男性");
    set("title", "回疆碧刀门掌门");
    set("age", 45);
    set("long", @LONG
一位身材魁梧的汉子，满面髯须，神情甚是威
武。他便是回疆碧刀门掌门乌老大，他在天山
缥缈峰灵鹫宫下组织了万仙大会，预谋铲除天
山童姥，后来被虚竹子所降服。
LONG );
    set("attitude", "peaceful");
    set("str", 30);
    set("int", 30);
    set("con", 30);
    set("dex", 30);

    set("qi", 4500);
    set("max_qi", 4500);
    set("jing", 2200);
    set("max_jing", 2200);
    set("neili", 4800);
    set("max_neili", 4800);
    set("jiali", 150);
    set("combat_exp", 2200000);

    set_skill("force", 200);
    set_skill("yaogu-xinfa", 200);
    set_skill("blade", 200);
    set_skill("biyan-dao", 200);
    set_skill("dodge", 180);
    set_skill("feiyan-zoubi", 180);
    set_skill("hand", 180);
    set_skill("jiuqu-zhegufa", 180);
    set_skill("parry", 180);
    set_skill("martial-cognize", 180);
    set_skill("literate", 120);

    map_skill("force", "yaogu-xinfa");
    map_skill("blade", "biyan-dao");
    map_skill("dodge", "feiyan-zoubi");
    map_skill("parry", "biyan-dao");
    map_skill("hand", "jiuqu-zhegufa");

    prepare_skill("hand", "jiuqu-zhegufa");

    set("inquiry", ([
        "屠人赛"     : (: ask_me :),
        "屠人大赛"   : (: ask_me :),
        "屠人比赛"   : (: ask_me :),
        "瀑落九霄"   : (: ask_skill :),
        "绿波香露刀" : (: ask_dao :),
    ]));

    set("count", 1);

    create_family("碧刀门", 7, "掌门");

    setup();

    if (clonep())
    {
        ob = find_object(XIANGLUDAO);
        if (! ob) ob = load_object(XIANGLUDAO);
        if (! environment(ob))
        {
            ob->move(this_object());
            ob->wield();
        } else
        {
            ob = new("/clone/weapon/gangdao");
            ob->move(this_object());
            ob->wield();
        }
    }

    carry_object("/clone/cloth/cloth")->wear();
}

int recognize_apprentice(object ob, string skill)
{
    if (ob->query("family/family_name") != "灵鹫宫")
    {
        command("heng");
        command("say 哪里来的臭贼？居然打起俺的主意来了！");
        return -1;
    }

    if (ob->query("family/master_id") != "xuzhu zi")
    {
        command("grin");
        command("say 恐怕这灵鹫宫里，还轮不到你说话。");
        return -1;

    }

    if (skill != "biyan-dao" && skill != "blade")
    {
        command("consider");
        command("say 我只能教你一些刀法功夫，其它你还是跟门主学吧。");
        return -1;
    }

    if (skill == "blade" && ob->query_skill("blade", 1) > 179)
    {
        command("hmm");
        command("say 你已经学得差不多了，剩下的就自己去研究吧。");
        return -1;
    }

    if (! ob->query_temp("can_learn/wulaoda"))
    {
        command("qnod");
        command("say 既然你感兴趣，又是主公的弟子，乌某就教你这套碧烟刀法。");
        ob->set_temp("can_learn/wulaoda", 1);
    }
    return 1;
}

mixed ask_skill()
{
    object me;

    me = this_player();
    if (me->query("can_perform/biyan-dao/luo"))
        return "我已经说得够多了，别跟我纠缠不休。";

    if (me->query("family/family_name") != "灵鹫宫" &&
       me->query("family/family_name") != "碧刀门")
        return "哼！不知阁下这话是什么意思？";

    if (me->query_skill("biyan-dao", 1) < 1)
        return "你碧烟刀法都未曾练过，还谈什么绝招。";

    if (me->query("family/family_name") == "灵鹫宫" &&
       me->query("gongxian") < 250)
        return "主公有令，不得传功给无功劳的弟子。";

    if (me->query_skill("force") < 120)
        return "你的内功练成这样，还练什么刀法！";

    if ((int)me->query("max_neili", 1) < 1000)
        return "你的内力弱成这样，还练什么刀法！";

    if (me->query_skill("biyan-dao", 1) < 80)
        return "你的碧烟刀法火候还差得远，再回去练练！";

    message_vision(HIY "$n" HIY "愣了一愣，随即大笑数声。伸手将$N"
                   HIY "招到身前，低声在$N" HIY "耳旁嘀\n咕了半天"
                   "。不时还拔出腰刀挥舞几下，似乎是一种颇为神妙的"
                   "刀诀。\n" NOR, me, this_object());
    command("haha");
    command("say 就是这般，你自己练去吧。");
    tell_object(me, HIC "你学会了「瀑落九霄」。\n" NOR);

    if (me->can_improve_skill("blade"))
        me->improve_skill("blade", 1500000);
    if (me->can_improve_skill("biyan-dao"))
        me->improve_skill("biyan-dao", 1500000);
    me->improve_skill("martial-cognize", 1500000);
    me->set("can_perform/biyan-dao/luo", 1);
    if (me->query("family/family_name") == "灵鹫宫")
        me->add("gongxian", -250);
    return 1;
}

mixed ask_dao()
{
    object me;
    object ob;
    object owner;

    me = this_player();

    if (me->query("family/family_name") != "灵鹫宫" &&
       me->query("family/family_name") != "碧刀门")
        return "哪里来的臭贼？居然敢打俺宝刀的主意！";

    if (me->query("family/master_id") != "xuzhu zi" &&
       me->query("family/master_id") != "wu laoda")
        return "我的宝刀可不是任何人都能用的，要用找你师父来拿。";

    if (me->query_skill("biyan-dao", 1) < 100)
        return "你还是先跟我学点刀法吧。";

    ob = find_object(XIANGLUDAO);
    if (! ob) ob = load_object(XIANGLUDAO);
    owner = environment(ob);
    while (owner)
    {
        if (owner->is_character() || ! environment(owner))
            break;
        owner = environment(owner);
    }

    if (owner == me)
        return "我的宝刀不就是你拿着在用吗？";

    if (objectp(owner) && owner != this_object())
    {
        if (! owner->is_character())
            return "你来晚了一步，我的宝刀已经让别人取去了。";

        if (owner->query("family/family_name") == "碧刀门")
            return "我的宝刀现在是我徒弟" + owner->query("name") +
                   "在用，你要用就去找他吧。";
        else
        if (owner->query("family/family_name") == "灵鹫宫")
            return "我的宝刀被你们灵鹫宫的" + owner->query("name") +
                   "取去了，你要用就去找他吧。";
        else
            return "我的宝刀现在落到了" + owner->query("name") +
                   "手中，你去找他吧！";
    }
    ob->move(this_object());

    ob = new("/clone/weapon/gangdao");
    ob->move(this_object());
    ob->wield();
    message_vision(CYN "$N" CYN "叹道：罢了，罢了！我这宝刀你就拿去用吧，可"
                   "别弄丢了。\n" NOR, this_object(), me);
    command("give xianglu dao to " + me->query("id"));

    if (query("count") > 0)
    {
    	ob = new("/d/lingjiu/npc/obj/yuping");
    	ob->move(this_object());
    	command("say 另外，这刀身涂抹的是我独门秘药，这瓶解药你也拿着，"
                "以备不时之需。");
    	command("give yu ping to " + me->query("id"));
        add("count", -1);
    }
    return 1;
}

void attempt_apprentice(object ob)
{
    if (! permit_recruit(ob))
        return;

    command("haha");
    command("say 不错！不错！");
    command("say 我回疆碧刀门人才稀少，眼下正是用人之时，就收下你吧。");
    command("recruit " + ob->query("id"));
}

void init()
{
    add_action("do_sign", "sign");
    add_action("do_join", "join");
}

mixed ask_me()
{
    object me;

    me = this_player();
    if (PK_D->is_pking())
        return "现在屠人大赛正在举行呢，你想干什么？";

    if (PK_D->is_ready())
        return "很好，现在屠人大赛正要开始，你要报名(sign)么？";

    return "屠人大赛？你慢慢等着吧。要是无聊，现在要是想进去玩玩(join)也行。";
}

int do_sign()
{
    object me;
    string msg;
    object ob;

    me = this_player();
    message_vision(CYN "\n$N" CYN "陪着笑脸对$n" CYN "道：您好，您好，我"
                   "也来签个到。\n" NOR, me, this_object());
    if (me->query("combat_exp") < 1000)
    {
        message_vision(CYN "$n" CYN "抬头看了看$N" CYN "，不屑道：就"
                       "你这点本事？只好参加被屠大赛！\n" NOR, me,
                       this_object());
        return 1;
    }

    if (stringp(msg = PK_D->reject_join(me)))
    {
        command("say " + msg);
        return 1;
    }

    if (objectp(me->query_temp("is_riding")))
    {
        command("say 屠人大赛又不是马术比赛，骑马的都给我下马！");
        return 1;
    }

    foreach (ob in deep_inventory(me))
        if (ob->is_character())
        {
            command("say 你背的谁？去比赛还拖家带口的？快给我滚！");
            message_vision(HIC "$N" HIC "飞起一脚，把$n" HIC "踢"
                           "倒在地！\n" NOR, this_object(), me);
            me->receive_damage("qi", 50);
            return 1;
        }

    message_vision(CYN "$n" CYN "点点头，对$N" CYN "道：很好，很好，你先"
                   "进去准备吧。\n\n" HIY "$N" HIY "点点头，向北面的准备"
                   "室走去。\n" NOR, me, this_object());
    me->move("/d/pk/ready");
    message("vision", HIW + me->name() + HIW "精神抖擞的走了进来。\n" NOR,
                      environment(me), ({ me }));
    return 1;
}

int do_join()
{
    return notify_fail(CYN "乌老大怒道：靠，进什么进？今日上面的查下来，"
                       "我铺面都被封了。\n" NOR);

    if (PK_D->is_pking())
        return notify_fail(CYN "乌老大眉头一皱道：现在里面正比赛呢，"
                           "你这些人等等吧。\n" NOR);

    if (PK_D->is_ready())
        return notify_fail(CYN "乌老大懒懒道：要想正式比赛就进去，其"
                           "他人先等着。\n" NOR);

    message_vision(CYN "$N" CYN "赔笑对$n" CYN "道：我进去溜达溜达，放行"
                   "可好？\n" NOR, this_player(), this_object());

    if (PK_D->join_competition(this_player()))
    {
        message("vision", HIW + this_player()->name() + HIW "一溜小跑"
                "进了屠人场。\n" NOR, environment());
        return 1;
    }
    return 0;
}

void unconcious()
{
    die();
}
