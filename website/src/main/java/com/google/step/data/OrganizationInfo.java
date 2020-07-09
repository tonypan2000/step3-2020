package com.google.step.data;

import com.google.api.gax.rpc.ResourceExhaustedException;
import com.google.apphosting.api.DeadlineExceededException;
import com.google.cloud.language.v1.ClassificationCategory;
import com.google.cloud.language.v1.ClassifyTextRequest;
import com.google.cloud.language.v1.ClassifyTextResponse;
import com.google.cloud.language.v1.Document;
import com.google.cloud.language.v1.Document.Type;
import com.google.cloud.language.v1.EncodingType;
import com.google.cloud.language.v1.LanguageServiceClient;
import com.opencsv.*;
import com.opencsv.exceptions.CsvValidationException;
import java.io.*;
import java.sql.*;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletRequest;

public final class OrganizationInfo {
  private final int id;
  private final String name;
  private final String link;
  private final String about;
  private final List<String> classification;
  private final String neighbor1;
  private final String neighbor2;
  private final String neighbor3;
  private final String neighbor4;

  private OrganizationInfo(int id, String name, String link, String about, List<String> classification) {
    this.id = id;
    this.name = name;
    this.link = link;
    this.about = about;
    this.classification = classification;
    this.neighbor1 = null;
    this.neighbor2 = null;
    this.neighbor3 = null;
    this.neighbor4 = null;
  }

  private OrganizationInfo(int id, String name, String link, String about, 
        String neighbor1, String neighbor2, String neighbor3, String neighbor4) {
    this.id = id;
    this.name = name;
    this.link = link;
    this.about = about;
    this.neighbor1 = neighbor1;
    this.neighbor2 = neighbor2;
    this.neighbor3 = neighbor3;
    this.neighbor4 = neighbor4;
    this.classification = null;
  }

  /** Detects categories in text using the Language Beta API. */
  private static List<String> classifyText(String text) {
    // [START language_classify_text]
    // Instantiate the Language client com.google.cloud.language.v1.LanguageServiceClient
    try (LanguageServiceClient language = LanguageServiceClient.create()) {
      // set content to the text string
      Document doc = Document.newBuilder().setContent(text).setType(Type.PLAIN_TEXT).build();
      ClassifyTextRequest request = ClassifyTextRequest.newBuilder().setDocument(doc).build();
      // detect categories in the given text
      ClassifyTextResponse response = language.classifyText(request);

      if (!response.getCategoriesList().isEmpty()) {
        String mainClassification = response.getCategoriesList().get(0).getName();
        System.out.println(mainClassification);
        return Arrays.asList(mainClassification.split("/", 1))
            .stream()
            .filter(classification -> !classification.isEmpty())
            .collect(Collectors.toList());
      } else {
        return null;
      }
    } catch (Exception ex) {
      System.err.println(ex);
      return null;
    } 
    // [END language_classify_text]
  }

   private static List<List<String>> testClasses = Arrays.asList(
      Arrays.asList("Coding","Testing","Test1"),
      Arrays.asList("Coding","Testing","Test2"),
      Arrays.asList("Coding","Testing","Test3"),
      Arrays.asList("Coding1","1Testing1","8Test1"),
      Arrays.asList("Coding1","1Testing1","8Test2"),
      Arrays.asList("Coding1","1Testing3","8Test3"),
      Arrays.asList("Coding2","2Testing2","2Test"),
      Arrays.asList("Coding2","2Testing2","2Test"),
      Arrays.asList("Coding2","2Testing2","2Test"),
      Arrays.asList("Coding3","3Testing3","3Test"),
      Arrays.asList("Coding3","3Testing3","3Test"),
      Arrays.asList("Coding3","3Testing4","3Test4"),
      Arrays.asList("Coding3","3Testing4","3Test5"));

  public static OrganizationInfo getClassifiedOrgFrom(String[] record, int index) {
    String name = record[0];
    String link = record[1];
    String about = record[2];
    String sectionToClassify = name + " " + about;
    if (sectionToClassify.split(" ").length <= 20) {
        return null;
    }
    //Classify submission by name and about, stop if unclassifiable
    List<String> classification = classifyText(sectionToClassify); //testClasses.get(index%13); //
    try {
      if (classification.isEmpty()) {
        return null;
      }  
    } catch (NullPointerException ex) {
      System.err.println(ex);
      return null;
    }
    return new OrganizationInfo(index, name, link, about, classification);
  }

  public static OrganizationInfo getResultOrgFrom(ResultSet rs) throws SQLException {
    int id = rs.getInt("id");
    String name = rs.getString("name");
    String link = rs.getString("link");
    String about = rs.getString("about");
    String neighbor1 = rs.getString("neighbor1");
    String neighbor2 = rs.getString("neighbor2");
    String neighbor3 = rs.getString("neighbor3");
    String neighbor4 = rs.getString("neighbor4");
        
    return new OrganizationInfo(id, name, link, about, neighbor1, neighbor2, neighbor3, neighbor4);
  }

  public void passInfoTo(PreparedStatement statement) throws SQLException {
    statement.setInt(1, this.id);
    statement.setString(2, this.name);
    statement.setString(3, this.link);
    statement.setString(4, this.about);
    String classPath = String.join("/", this.classification);
    statement.setString(5, classPath);
  }
}
