#include <ansi.h>

inherit NPC;

void create()
{
    seteuid(getuid());
    set_name("神算子", ({"shensuan zi", "shen", "suan", "shensuan", "zi"}));
    set("title", HIY "天机道人" NOR);
    set("gender", "男性");
    set("age", 50);
    set("long", "一位邋邋遢遢的道士，自称可占卜(zhanbu)号码吉凶，每天仅算数十卦。\n");
    set("attitude", "heroism");
    set("class", "taoist");

    set("str", 21);
    set("con", 30);
    set("int", 27);
    set("dex", 23);

    set("max_qi", 600);
    set("max_jing", 300);
    set("neili", 600);
    set("max_neili", 600);
    set("jiali", 30);
    set("env/wimpy", 60);

    set_temp("apply/attack", 10);
    set_temp("apply/defense", 20);

    set("combat_exp", 25000);

    set_skill("force", 43);
    set_skill("unarmed", 51);
    set_skill("sword", 37);
    set_skill("dodge", 59);
    set_skill("parry", 40);
    set_skill("taiji-quan", 42);
    set_skill("taiji-jian", 41);
    set_skill("taiji-shengong", 40);
    set_skill("tiyunzong", 53);

    map_skill("force", "taiji-shengong");
    map_skill("unarmed", "taiji-quan");
    map_skill("parry", "taiji-quan");
    map_skill("sword", "taiji-jian");
    map_skill("dodge", "tiyunzong");

    create_family("武当派", 3, "弟子");

    // set("chat_chance", 5);
    // set("chat_msg", ({(: random_move :)}));

    setup();
}

void init()
{
    object ob;

    add_action("do_zhanbu", "zhanbu");

    if (interactive(ob = this_player()) && !is_fighting())
    {
        remove_call_out("greeting");
        call_out("greeting", 1, ob);
    }
}

void greeting(object ob)
{
    if (!ob || environment(ob) != environment())
        return;

    say(CYN "神算子笑咪咪地说道：这位" + RANK_D->query_respect(ob) +
        CYN "要算卦吗？贫道只测(zhanbu)号码吉凶，每日十卦。\n" NOR);
}

int do_zhanbu(string arg)
{
    object me = this_player();

    if (pcre_match(arg, "^1[3-9][0-9]{9}$"))
    {
        __DIR__ "_api_luck"->query(me, to_int(arg));
        msg("info", "$ME拿出纸条写了一串数字给神算子。\n", me);
        msg("info", "神算子接过纸条看了看，摆出龟甲为$ME占卜号码吉凶。\n", me);
    }
    else
    {
        msg("info", "神算子对$ME说到：贫道只占卜号码吉凶，请报和你生活息息相关的号码。\n", me);
    }

    return 1;
}
