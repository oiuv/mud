
//子虚道人  

#include <ansi.h>
              
inherit NPC;
inherit F_UNIQUE;


#define MIRROR        "/adm/daemons/task/mirror"


int ask_mirror();
int ask_hulu();

void create()
{         seteuid(getuid());
        set_name("子虚道人", ({ "zixu daoren", "zixu", "daoren" }));
        set("long", @LONG
此人身着道袍，须发皆白，一副仙风道骨的气
派。这便是武林中号称「子虚乌有」二道仙中
的子虚道人。传说此人早已得道成仙，可通神
界。
LONG);
        set("nickname", HIW "仙风道骨" NOR);
        set("title", HIC "子虚观观主" NOR);
        set("gender", "男性" );
        set("age", 108);
        set("attitude", "friendly");
        set("max_jing", 50000);
        set("max_qi", 50000);
        set("max_jingli", 50000);
        set("jingli", 50000);
        set("max_neili", 50000);
        set("neili", 50000);
        set("jiali", 350);
        set("str", 50);
        set("int", 50);
        set("con", 50);
        set("dex", 50);
        set("combat_exp", 12000000);

        set("inquiry", ([
                       "乾坤宝镜"      : (: ask_mirror :),
                       "宝镜"      : (: ask_mirror :),
                       "mirror"      : (: ask_mirror :),    
//              "紫金葫芦"    : (: ask_hulu :),
//                 "hulu"    : (: ask_hulu :),
        ]));

        set_skill("force", 500);
        set_skill("huntian-baojian", 500);
        set_skill("parry", 500);
        set_skill("dodge", 500);
        set_skill("unarmed", 500);
        set_skill("sword", 500);
        set_skill("lunhui-jian", 500);
        set_skill("poison", 500);
        set_skill("medical", 500);
        set_skill("lingbo-weibu", 500);
        set_skill("qiankun-danuoyi", 500);
        set_skill("buddhism", 500);
        set_skill("taoism", 500);
        set_skill("literate", 500);
        set_skill("martial-cognize", 500);

        map_skill("force", "huntian-baojian");
        map_skill("parry", "qiankun-danuoyi");
        map_skill("unarmed", "huntian-baojian");
        map_skill("dodge", "lingbo-weibu");
        map_skill("sword", "lunhui-jian");

        prepare_skill("unarmed", "huntian-baojian");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.hui" :),
                (: perform_action, "sword.hui" :),
                (: perform_action, "sword.hui" :),
                (: exert_function, "sword" :),
                (: exert_function, "sword" :),
                (: exert_function, "sword" :),
                (: exert_function, "recover" :),
                (: exert_function, "regenerate" :),
                (: exert_function, "powerup" :),
        }));

    
        setup();
        carry_object("/d/wudang/obj/whiterobe")->wear();

}


int ask_mirror()
{       
    
      object me, ob, *obj;
      int i,have;
      me = this_player();
      have = 0;

      obj = all_inventory(me);
                for(i=0; i<sizeof(obj); i++) 
                {       
                        if (base_name(obj[i]) == MIRROR)
                        {
                  have = 1;
                        }  
         }

            if ( have == 1 )

            {
               message_vision(HIG "$N对$n说道：“你身上已经有一个宝镜了，"
                                                  "别贪得无厌！”\n"NOR,
                                this_object(),me );
               return 1;
            }
            else
            {

           ob = new(MIRROR);
           ob->move(me);

       message_vision(HIG "$N盯着$n看了看，说道：“嗯，这个宝镜你可得慎用！\n"
                         "好好用它锻炼锻炼你的判断力和观察力吧。”\n"NOR
                         CYN"$N从怀里拿出一面乾坤宝镜交给$n。\n"NOR,
                            this_object(), me);
              return 1;
            }

      return 1;

}


void unconcious()
{
        die();
}
