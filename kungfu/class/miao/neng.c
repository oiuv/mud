#include <ansi.h>

inherit NPC;

void create()
{
        set_name("锺兆能", ({ "zhong zhaoneng", "zhong", "zhaoneng", "neng" }));
        set("long", @LONG
这人是锺氏三雄的老三锺兆能。只见他身穿白
色粗麻布衣服，白帽白鞋，衣服边上露着毛头，
竟是刚死了父母的孝子服色，脸色惨白，鼻子
又扁又大，鼻孔朝天，却没留有胡子。
LONG );
        set("nickname", HIR "锺氏三雄" NOR);
        set("title", "鄂北锺氏兄弟");
        set("gender", "男性");
        set("age", 39);
        set("attitude", "peaceful");
        set("str", 23);
        set("int", 27);
        set("con", 25);
        set("dex", 24);

        set("qi", 1800);
        set("max_qi", 1800);
        set("jing", 1200);
        set("max_jing", 1200);
        set("neili", 2200);
        set("max_neili", 2200);
        set("jiali", 60);
        set("combat_exp", 600000);
        set("score", 3000);

        set_skill("force", 140);
        set_skill("xueshan-neigong", 140);
        set_skill("dodge", 140);
        set_skill("feiyan-zoubi", 140);
        set_skill("parry", 140);
        set_skill("cuff", 140);
        set_skill("cha-quan", 140);
        set_skill("staff", 140);
        set_skill("suoming-zhang", 140);
        set_skill("literate", 100);
        set_skill("martial-cognize", 140);

        map_skill("force", "xueshan-neigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("cuff", "cha-quan");
        map_skill("staff", "suoming-zhang");
        map_skill("parry", "suoming-zhang");

        prepare_skill("cuff", "cha-quan");

        create_family("鄂北锺氏", 6, "传人");

        setup();

        carry_object("/d/zhongzhou/npc/obj/zhaohun")->wield();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 15);
}

void attempt_apprentice(object ob)
{
        command("hmm");
        command("say 走开，我不收徒。");
}
