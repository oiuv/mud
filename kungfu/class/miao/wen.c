#include <ansi.h>

inherit NPC;
inherit F_GUARDER;

void create()
{
        set_name("锺兆文", ({ "zhong zhaowen", "zhong", "zhaowen", "wen" }));
        set("long", @LONG
这人是锺氏三雄的老大锺兆文。只见他身穿白
色粗麻布衣服，白帽白鞋，衣服边上露着毛头，
竟是刚死了父母的孝子服色，脸色惨白，鼻子
又扁又大，鼻孔朝天，留着灰白小胡子。
LONG );
        set("nickname", HIR "锺氏三雄" NOR);
        set("title", "鄂北锺氏兄弟");
        set("gender", "男性");
        set("age", 48);
        set("attitude", "peaceful");
        set("str", 23);
        set("int", 27);
        set("con", 25);
        set("dex", 24);

        set("qi", 4500);
        set("max_qi", 4500);
        set("jing", 3000);
        set("max_jing", 3000);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 80);
        set("combat_exp", 800000);
        set("score", 3000);

        set_skill("force", 160);
        set_skill("xueshan-neigong", 160);
        set_skill("dodge", 160);
        set_skill("feiyan-zoubi", 160);
        set_skill("parry", 160);
        set_skill("cuff", 160);
        set_skill("liuhe-quan", 160);
        set_skill("staff", 160);
        set_skill("suoming-zhang", 160);
        set_skill("literate", 140);
        set_skill("martial-cognize", 160);

        map_skill("force", "xueshan-neigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("cuff", "liuhe-quan");
        map_skill("staff", "suoming-zhang");
        map_skill("parry", "suoming-zhang");

        prepare_skill("cuff", "liuhe-quan");

        set("coagents", ({
                ([ "startroom" : "/d/zhongzhou/miaojia_houting",
                   "id"        : "miao renfeng" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "冷笑道："
                                "什么人？居然连苗大侠的府邸都敢乱"
                                "闯！" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背负的是什么人？还不快快给我"
                                "放下！" NOR,
        ]));

        create_family("中原苗家", 6, "助手");

        setup();

        carry_object("/d/zhongzhou/npc/obj/lingpai")->wield();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 15);
}

void attempt_apprentice(object ob)
{
        command("hmm");
        command("say 走开，我不收徒。");
}
