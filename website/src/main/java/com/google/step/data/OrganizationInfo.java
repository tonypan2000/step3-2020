package com.google.step.data;

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

    private OrganizationInfo(int id, String name, String link, String about, List<String> classification) {
      this.id = id;
      this.name = name;
      this.link = link;
      this.about = about;
      this.classification = classification;
    }


  /** Detects categories in text using the Language Beta API. */
  private static List<String> classifyText(String text) throws Exception {
    // [START language_classify_text]
    // Instantiate the Language client com.google.cloud.language.v1.LanguageServiceClient
    try (LanguageServiceClient language = LanguageServiceClient.create()) {
      // set content to the text string
      Document doc = Document.newBuilder().setContent(text).setType(Type.PLAIN_TEXT).build();
      ClassifyTextRequest request = ClassifyTextRequest.newBuilder().setDocument(doc).build();
      // detect categories in the given text
      ClassifyTextResponse response = language.classifyText(request);

      return response.getCategoriesList().stream()
          .map(ClassificationCategory::getName)
          .map(category-> Arrays.asList(category.split("/", 0)))
          .collect(ArrayList<String>::new, List::addAll, List::addAll)
          .stream()
          .filter(category -> !category.isEmpty())
          .collect(Collectors.toCollection(ArrayList::new));
    }
    // [END language_classify_text]
  }

  public static OrganizationInfo getClassifiedOrgFrom(ResultSet rs) throws Exception{
    int id = rs.getInt("id");
    String name = rs.getString("name");
    String link = rs.getString("link");
    String about = rs.getString("about");
    //Classify submission by name and about, stop if unclassifiable
    List<String> classification = classifyText(name + " " + about);
    if (classification.isEmpty()){
      return null;
    }  
    return new OrganizationInfo(id, name, link, about, classification);
  }
}
