
inherit F_DBASE;

#include <ansi.h>

#define ZIXU          "/adm/daemons/task/npc/zixu"      //task����������
#define TASK_CARRIER  "/adm/daemons/task/npc/task_carrier" //task Я����
#define TASK_OBJECT   "/adm/daemons/task/obj/"            //task���Ŀ¼
#define MIRROR        "/adm/daemons/task/mirror.c"        //�������õ�·��

void create()
{
        seteuid(getuid());
        set("name", HIG "�������񷢲�����" NOR);
        set("id", "mirror daemon");
        call_out("task_reminder", 20);
}

void task_reminder()
{
      object zixu = find_object(ZIXU);
      if ( ! zixu) zixu = load_object(ZIXU);

      CHANNEL_D->do_channel(zixu, "chat",
                  HIR"��ע�⣬���������������ֺ����·ֲ���\n" NOR);

      remove_call_out("set_task");
      call_out("set_task", 180);

}

void set_task()
{
    object npc, zixu, task, *mirror, mirror_owner, *npc_inv;
    string *i_list,*ip;
    int level, x, i,ii,same,y;

    zixu = find_object(ZIXU);
    if ( ! zixu) zixu = load_object(ZIXU);
    level = random(15) + 1;

    CHANNEL_D->do_channel(zixu, "chat", HIY"�����������·ֲ���ϡ�\n"NOR);

    remove_call_out("task_reminder");
    call_out("task_reminder", 1020);

       i_list = get_dir(TASK_OBJECT);

       for(x=0; x<sizeof(i_list); x++)
       {
             task = find_object(TASK_OBJECT + i_list[x]);
             if (task) destruct(task);

       }

       for(x=0; x<sizeof(i_list); x++)
       {

        task = find_object(TASK_OBJECT + i_list[x]);
        if (! task)
           {
                npc = new(TASK_CARRIER);

                task = load_object(TASK_OBJECT + i_list[x]);
                task->set("task_time", time()/100);


                NPC_D->place_npc(npc, 0);
                if ( strsrch(npc->query("long"), "һ��ʰ����") > -1 )
                {  //����npc��αװ
                    npc_inv = all_inventory(npc);
                    for(y=0; y<sizeof(npc_inv); y++)
                    {
                       destruct(npc_inv[y]);
                    }
                    npc->carry_object("/clone/cloth/cloth")->wear();
                    npc->set("combat_exp",1);
                } else
                {
                NPC_D->set_from_me(npc, zixu, random(100)+1);
                npc->add_temp("apply/attack", npc->query_skill("force") *
                                             (level - 1) / 15);
                npc->add_temp("apply/dodge", npc->query_skill("force") *
                                            (level - 1) / 15);
                npc->add_temp("apply/parry", npc->query_skill("force") *
                                            (level - 1) / 15);
                npc->add_temp("apply/damage", 5 + level * 7);
                npc->add_temp("apply/unarmed_damage", 5 + level * 7);
                npc->add_temp("apply/armor", 10 + level * 15);
                }
                task->move(npc);
                NPC_D->random_move(npc);
                NPC_D->random_move(npc);
                NPC_D->random_move(npc);
                NPC_D->random_move(npc);
            }
         }

      mirror = children(MIRROR);

      if ( sizeof(mirror) == 1 ) return; //ֻ�������û���κ�clone������

      for(i=0; i<sizeof(mirror); i++)
      {

               if (! clonep(mirror[i])) continue;  //�����������ע��

               mirror_owner = environment(mirror[i]);

               if ( query_ip_number(mirror_owner) == 0 )
               {
                            destruct(mirror[i]);
                            tell_object(mirror_owner, "��Ŀǰû��ip��ַ�����"
                               "��鱦����������û�ա�\n");
                            continue;
                }

               if (! ip )
               {
                   ip = ({query_ip_number(mirror_owner)});

                    mirror[i]->set("power",100);
                    tell_object(mirror_owner, HIR"ֻ��һ�����ע�����Ǭ����"
                                          "�����棬ʹ����ʱ����������\n"NOR);
                    continue;
               }
               else
               {
                  same = 0;
                  for(ii=0; ii<sizeof(ip); ii++)
                  {
                      if ( query_ip_number(mirror_owner) == ip[ii] )
                         same = 1;
                   }
                if ( same == 1 )
                {
                   destruct(mirror[i]);
                   tell_object(mirror_owner, "������ip��������ı�����"
                               "��鱦����������û�ա�\n");
                }  else
                {
                   ip += ({query_ip_number(mirror_owner)});
                   mirror[i]->set("power",100);
                   tell_object(mirror_owner, HIR"ֻ��һ�����ע�����Ǭ����"
                                          "�����棬ʹ����ʱ����������\n"NOR);
                 }
              }

      }

}

int do_return(object ob, object me, string arg)
{
    string target, item;
    object who,pay;
    //int count,exp,pot,tihui,gx;
    int count,exp,pot,gx;
    //������������ 2016-12-21
    int score;
    int kar;
        
    if (! arg) return notify_fail("��Ҫ��˭ʲô������\n");

    if (sscanf(arg, "%s to %s", item, target) != 2 &&
            sscanf(arg, "%s %s", target, item) != 2 )
    return 0;

    if ( item != ob->query("id") ) return 0;

    who = present(target, environment(me));

        if (! objectp(who))
        return notify_fail("����û������ˡ�\n");

    if ( who->query("id") != ob->query("owner_id") ) return 0;

    if (! living(who))
       return notify_fail("�㻹�ǵõ��˼�������˵�ɡ�\n");


    /*if ( me->query("mirror_task/task_time") != ob->query("task_time") )
       {
         me->delete("mirror_task");
         me->set("mirror_task/task_time", ob->query("task_time") );
       }*/
	   //ȡ��taskÿ������
	if(me->query("mirror_task/count")<30)
       me->add("mirror_task/count",1);
	else
		me->set("mirror_task/count",1);

       me->add("mirror_count",1);

       count =  me->query("mirror_task/count");
 
/*
    exp = 1000 + random(1000);
   
    if ( count > 20 ) pot = 800 + random(100);
    else
    if ( count > 10 ) pot = 700 + random(100);
    else
    pot = 600 + random(100);

    if ( count == 10 ) pot += 800;
    if ( count == 20 ) pot += 1000;
    if ( count == 30 ) pot += 1500;
*/
//����task����pot���� 2017-02-02
    exp = 1000 + random(1000);
//������λԽ������Խ�Ͷ�λԽģ����Ҳ����˵ÿ�θ���һ�ֵ�30��������Խ����Ѱ���Ѷ�Խ�󣬹�Խ����pot����Խ�� 2017-02-02
//��һ�����task����������ʵ��Ϊ�ֶ��������������Ϊ���ĳ���ȫ�Զ�task����������Ӱ��ƽ�⣬task����Ľ�����Ӧ�ô�öࡣ 2017-02-24
    if ( count > 20 ) pot = 5000 + random(2500);
    else
    if ( count > 10 ) pot = 2000 + random(1000);
    else
    if ( count > 5 ) pot = 1000 + random(500);
    else
    pot = 600 + random(300);

    if ( count == 10 ) pot += 1000;
    if ( count == 20 ) pot += 3000;
    if ( count == 30 ) pot += 10000;//ÿ�θ���30��task��Ʒ����30��ȫ�������Ӧ�Ӵ������ȣ�����ô�о�30��ȫ����ǲ����ܵ����顣������ 2017-02-02



    //gx = 1 + random(2);
    gx = 2 + random(2);
    //������������ 2016-12-21
    kar = me->query("kar");//�޸��������Ӻ͸�Ե�ҹ� 2016-12-21
    score = 20 + random(kar);
    me->add("combat_exp", exp);
    me->add("potential", pot);
  //  me->add("experience", tihui);
    me->add("gongxian", gx);
    //������������ 2016-12-21
    me->add("score",score);
    me->delete("xquest/mirror");


    tell_object(me, "���ó�" + ob->name() + "(" + ob->query("id") + ")��" +
    who->name() + "��\n" + WHT + who->name() + "˵�������������Ƕ�л��λ" +
    RANK_D->query_respect(me) + "�ˡ���\n"NOR);

    tell_object( me, HIY"��������һ����ɵĵ�" +  HIR +
                     chinese_number(me->query("mirror_task/count")) + NOR + HIY
                     "����������\n"NOR +
                  HIG"ͨ����ζ�����������"NOR HIR + chinese_number(exp)+
                  HIG"�㾭�飬"NOR HIW + chinese_number(pot) + NOR
                  HIG"��Ǳ�ܣ�"NOR HIC + chinese_number(score) + NOR + HIG"��������\n"NOR
                  HIW"��ӽ�����ʮ���������Լ�" + chinese_number(gx) +
                  "�����ɹ��ס�\n"NOR);
    if ( me->query("mirror_count"))
    {
       tell_object( me, HIY"���ۼ������" +  HIR +
                    chinese_number(me->query("mirror_count")) + NOR + HIY
                    "����������\n"NOR);
    }
    message("vision",me->name() + "�ó�" + ob->name() + "(" + ob->query("id") +
                 ")��" + who->name() + "��\n" + WHT + who->name() + "˵����"
                 "���������Ƕ�л��λ" + RANK_D->query_respect(me) +
                 "�ˡ���\n"NOR, environment(me),({me}));

    pay = new("/clone/money/silver");
    pay->set_amount(30);
    pay->move(me, 1);

  /*  log_file("static/mirror", sprintf("%s(%s) ����Ʒ at %s.\n",
             me->name(1), me->query("id"), ctime(time())));  */

 destruct(ob);
    //task����100��200��400����Ʒ by н������
    if ( me->query("mirror_count") == 100 || me->query("mirror_count") == 200 || me->query("mirror_count") == 300 ||
    	   me->query("mirror_count") == 400 || me->query("mirror_count") == 500 )
       call_other(__FILE__,"set_item", me);
    return 1;

}

string set_item(object me)
{
	//task����100��200��400����Ʒ by н������
        // ���100��task�������衢��Դ��
         string *ob1_list = ({
                "/clone/fam/gift/perwan",
                "/clone/fam/gift/kardan",
        });
        
        // ���200��task��7�ɵ�
        string *ob2_list = ({
                "/clone/fam/gift/str2",
                "/clone/fam/gift/int2",
                "/clone/fam/gift/con2",
                "/clone/fam/gift/dex2",
        });
        
        // ���300��task��85�ɵ�
        string *ob3_list = ({
                "/clone/fam/gift/str3",
                "/clone/fam/gift/int3",
                "/clone/fam/gift/con3",
                "/clone/fam/gift/dex3",
        });
        
        // ���400��task��ϡ������ϳɲ���
        string *ob4_list = ({
                "/clone/fam/item/xuantie",//��ɽ������100point�����쵶������
                "/clone/fam/etc/lv5f",  //��������
                "/clone/fam/etc/prize4",//ʥ��
                "/clone/fam/etc/prize5",//��ʥѪ��
        });

         // ���500��task���޻�����������ϡ�����ͼ
        string *ob5_list = ({
                "/clone/fam/obj/guo",//�޻���
                "/clone/fam/obj/guo",//�޻������Ӵ��޻������ֻ��ʣ�
                //"/clone/tattoo/spc11",//����֪ʶ��ͼ
                //"/clone/tattoo/spc12",//����ȭ��ͼ
                //"/clone/tattoo/spc13",//������ת��ͼ
        });
        string gift;
        object item;

        if (me->query("mirror_count") == 100)
        {
                gift = ob1_list[random(sizeof(ob1_list))];
              //log_file("static/mirror", sprintf("%s(%s) ����ɵ� at %s.\n",
              //me->name(1), me->query("id"), ctime(time())));

        } else
        	
        if (me->query("mirror_count") == 200)
        {
                gift = ob2_list[random(sizeof(ob2_list))];
              //log_file("static/mirror", sprintf("%s(%s) ����ɵ� at %s.\n",
              //me->name(1), me->query("id"), ctime(time())));

        } else
        	
        if (me->query("mirror_count") == 300)
        {
                gift = ob3_list[random(sizeof(ob3_list))];
              //log_file("static/mirror", sprintf("%s(%s) ����ɵ� at %s.\n",
              //me->name(1), me->query("id"), ctime(time())));

        } else
        
        if (me->query("mirror_count") == 400)
        {
                gift = ob4_list[random(sizeof(ob4_list))];
              //log_file("static/mirror", sprintf("%s(%s) ����ɵ� at %s.\n",
              //me->name(1), me->query("id"), ctime(time())));

        } else

        if (me->query("mirror_count") == 500)
        {
              me->delete("mirror_count");
              gift = ob5_list[random(sizeof(ob5_list))];
              //log_file("static/mirror", sprintf("%s(%s) ����޻��� at %s.\n",
              //me->name(1), me->query("id"), ctime(time())));

         }

         item = new(gift);
         item->move(me);

        if ( item->query("base_unit") )
           {
              tell_object(me,HIG"������һ" + item->query("base_unit") + NOR +
              item->name()+ "\n");
           }   else
           {
           tell_object(me,HIG"������һ" + item->query("unit") +  NOR +
           item->name()+ "\n");
           }

}
