#include <ansi.h>
inherit NPC;

void create()
{
        set_name("无尘道长", ({"wuchen daozhang", "wuchen", "daozhang"}));
        set("title", HIR "红花会二当家" NOR);
        set("nickname", HIW "追魂夺命剑" NOR );
        set("gender", "男性");
        set("age", 52);
        set("long", 
"他就是无尘道人。少年时混迹绿林，劫富济贫，做下了无数巨案，武
功高强，手下兄弟又众，官府奈何他不得。有一次他见到一位官家小
姐，竟然死心塌地的爱上了她。那位小姐却对无尘并没真心，受了父
亲教唆，一天夜里无尘偷偷来见她之时，那小姐说：“你对我全是假
意，没半点诚心。”无尘当然赌誓罚咒。那小姐道：“你们男人啊，
这样的话个个会说。你隔这么久来瞧我一次，我可不够。你要是真心
爱我，就把你一条手膀砍来给我。有你这条臂膀陪着，也免得我寂寞
孤单。”无尘一语不发，真的拔剑将自己的左臂砍了下来。小姐楼上
早埋伏了许多官差，一见都涌了出来。无尘已痛晕在地，哪里还能抵
抗？无尘手下的兄弟们大会群豪，打破城池，将他救出，又把小姐全
家都捉了来听他发落。众人以为无尘不是把他们都杀了，就是要了这
小姐做妻子。哪知他看见小姐，心肠一软，叫众人把她和家人都放了，
自己当夜悄悄离开了那地方，心灰意懒，就此出家做了道人。人虽然
出了家，可是本性难移，仍是豪迈豁达，行侠江湖，被红花会老当家
于万亭请出来做了副手。\n");
        set("attitude", "peaceful");
        set("class", "taoist");
        set("per", 21);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set("qi", 3800);
        set("max_qi", 3800);
        set("jing", 3000);
        set("max_jing", 3000);
        set("neili", 5000);
        set("max_neili", 5000);
        set("jiali", 150);

        set("combat_exp", 2500000);

        set_skill("force", 250);
        set_skill("bibo-shengong", 250);
        set_skill("unarmed", 250);
        set_skill("lianhuan-mizongtui", 250);
        set_skill("dodge", 250);
        set_skill("zhuihun-jian", 250);
        set_skill("parry", 250);
        set_skill("sword", 250);

        map_skill("force"  , "bibo-shengong");
        map_skill("unarmed", "lianhuan-mizongtui");
        map_skill("dodge"  , "lianhuan-mizongtui");
        map_skill("parry"  , "zhuihun-jian");
        map_skill("sword"  , "zhuihun-jian");

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "sword.zhu" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );
        setup();
        
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/wudang/obj/greyrobe")->wear();
    
}

